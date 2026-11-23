package me.rerere.rikkahub.data.kuan

import java.util.UUID
import kotlin.uuid.Uuid
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.put
import me.rerere.ai.provider.BuiltInTools
import me.rerere.ai.provider.Modality
import me.rerere.ai.provider.Model
import me.rerere.ai.provider.ModelAbility
import me.rerere.ai.provider.ModelType
import me.rerere.ai.provider.ProviderSetting
import me.rerere.rikkahub.AppScope
import me.rerere.rikkahub.data.datastore.SettingsStore
import me.rerere.rikkahub.data.datastore.findModelById
import me.rerere.rikkahub.data.datastore.getCurrentAssistant

internal enum class KuanLane { WEB, WORK }
internal data class KuanGroup(val id: Long, val name: String, val platform: String) {
    override fun toString() = name
}

internal data class KuanCatalogState(
    val groups: List<KuanGroup> = emptyList(),
    val groupId: Long? = null,
    val busy: Boolean = false,
    val error: String? = null,
)

internal data class KuanRoute(val scope: String, val groupId: Long, val lane: KuanLane) {
    val id: String get() = "$scope/$groupId/${lane.name}"
    val providerId: Uuid get() = stableId(id)

    fun modelId(model: String): Uuid = stableId("$id\n$model")

    companion object {
        fun parse(value: String?): KuanRoute? {
            val parts = value?.split("/") ?: return null
            if (parts.size != 3) return null
            val scope = runCatching { UUID.fromString(parts[0]).toString() }.getOrNull() ?: return null
            val group = parts[1].toLongOrNull()?.takeIf { it > 0 } ?: return null
            val lane = KuanLane.entries.firstOrNull { it.name == parts[2] } ?: return null
            return KuanRoute(scope, group, lane)
        }
    }
}

private fun stableId(value: String) = Uuid.parse(UUID.nameUUIDFromBytes(value.encodeToByteArray()).toString())

internal fun ProviderSetting.kuanRoute(): KuanRoute? = (this as? ProviderSetting.OpenAI)?.let {
    KuanRoute.parse(it.managedGroup)
}

internal fun KuanGroup.provider(scope: String, lane: KuanLane, models: List<Model>): ProviderSetting.OpenAI {
    val route = KuanRoute(scope, id, lane)
    return ProviderSetting.OpenAI(
        id = route.providerId,
        name = if (lane == KuanLane.WEB) "$name · GPT" else "$name · Work",
        models = models,
        baseUrl = KUAN_V1,
        useResponseApi = lane == KuanLane.WORK && platform == "openai",
        includeHistoryReasoning = false,
        managedGroup = route.id,
    )
}

internal fun managedModels(
    catalog: JsonObject,
    scope: String,
    group: KuanGroup,
    isAdmin: Boolean,
): List<ProviderSetting.OpenAI> {
    val rows = catalog.array("data") ?: throw KuanProtocolError("Model catalog is missing its model list")
    return KuanLane.entries.mapNotNull { lane ->
        val route = KuanRoute(scope, group.id, lane)
        val models = rows.mapNotNull { it as? JsonObject }.filter {
            it.flag("kuan_chatgpt_web") == (lane == KuanLane.WEB) &&
                (isAdmin || !it.flag("kuan_admin_only")) &&
                it.string("visibility")?.lowercase() != "hide" &&
                (it["supported_in_api"] as? JsonPrimitive)?.booleanOrNull != false
        }.sortedWith(compareBy<JsonObject> { it.int("priority") ?: Int.MAX_VALUE })
            .mapNotNull { parseModel(it, route) }.distinctBy { it.id }
        models.takeIf { it.isNotEmpty() }?.let { group.provider(scope, lane, it) }
    }
}

private fun parseModel(row: JsonObject, route: KuanRoute): Model? {
    val id = row.string("id")?.takeIf { it.isNotBlank() && it.length <= 256 } ?: return null
    val task = (row.string("task") ?: row.string("type").orEmpty()).lowercase().replace('-', '_')
    val outputs = row.strings("output_modalities")
    val kind = when {
        "video" in task || "video" in outputs || "audio" in outputs && "text" !in outputs -> return null
        task == "embedding" || task == "embeddings" -> ModelType.EMBEDDING
        route.lane == KuanLane.WEB -> ModelType.CHAT
        task in setOf("image", "image_generation", "text_to_image") ||
            outputs == listOf("image") ||
            outputs.isEmpty() && task in setOf("", "model") &&
            Regex("(?:^|[-_.])(?:image|images|imagine)(?:[-_.]|$)", RegexOption.IGNORE_CASE).containsMatchIn(id) ->
            ModelType.IMAGE
        else -> ModelType.CHAT
    }
    val levels = row.array("supported_reasoning_levels").orEmpty().mapNotNull {
        ((it as? JsonObject)?.string("effort") ?: (it as? JsonPrimitive)?.contentOrNull)
            ?.takeIf { effort -> effort.matches(Regex("[a-zA-Z0-9_.-]{1,40}")) }
    }.distinct().take(18)
    val tools = row.strings("enabled_tools") + row.strings("tools") + row.strings("supported_tools")
    return Model(
        id = route.modelId(id),
        modelId = id,
        displayName = row.string("display_name")?.takeIf(String::isNotBlank) ?: id,
        type = kind,
        contextLength = (row.int("context_window") ?: row.int("max_context_window"))
            ?.takeIf { it in 1000..10_000_000 } ?: 32_768,
        serverReasoningLevels = levels,
        abilities = buildList {
            if (levels.isNotEmpty()) add(ModelAbility.REASONING)
            if (route.lane == KuanLane.WORK && kind == ModelType.CHAT &&
                (row.flag("supports_parallel_tool_calls") || tools.any { it in setOf("function", "function_calling", "tools") })
            ) add(ModelAbility.TOOL)
        },
        inputModalities = listOf(Modality.TEXT) + if ("image" in row.strings("input_modalities")) listOf(Modality.IMAGE) else emptyList(),
        outputModalities = if (kind == ModelType.IMAGE) listOf(Modality.IMAGE) else listOf(Modality.TEXT),
        tools = if (route.lane == KuanLane.WORK && row.flag("supports_search_tool")) setOf(BuiltInTools.Search) else emptySet(),
    )
}

private fun JsonObject.strings(name: String) = array(name).orEmpty().mapNotNull { (it as? JsonPrimitive)?.contentOrNull }

internal class KuanCatalog(
    appScope: AppScope,
    private val session: KuanSession,
    private val api: KuanApi,
    private val settings: SettingsStore,
) {
    private val refreshLock = Mutex()
    private val keyLock = Mutex()
    private val mutableState = MutableStateFlow(KuanCatalogState())
    val state = mutableState.asStateFlow()
    private val keys = mutableMapOf<Pair<String, Long>, Pair<String, Long>>()
    private val confirmed = MutableStateFlow<Map<Uuid, ProviderSetting.OpenAI>>(emptyMap())
    private var currentScope: String? = null
    private var refreshedAt = 0L

    init {
        appScope.launch {
            session.state.map { state -> state.profile?.scope?.let { it to state.epoch } }
                .distinctUntilChanged().collectLatest { subject ->
                val scope = subject?.first
                refreshLock.withLock {
                    currentScope = scope
                    refreshedAt = 0L
                    mutableState.value = KuanCatalogState()
                    confirmed.value = emptyMap()
                    keyLock.withLock { keys.clear() }
                    settings.update { current ->
                        current.copy(providers = current.providers.map {
                            if (it.kuanRoute() != null) it.copyProvider(enabled = false) else it
                        })
                    }
                }
                if (scope != null) {
                    while (true) {
                        refresh()
                        delay(300_000)
                    }
                }
            }
        }
    }

    suspend fun refresh(groupId: Long? = null, force: Boolean = false) = refreshLock.withLock {
        val profile = session.state.value.profile ?: return@withLock
        val epoch = session.state.value.epoch
        if (currentScope != profile.scope) {
            currentScope = profile.scope
            refreshedAt = 0L
        }
        val before = mutableState.value
        if (!force && (groupId == null || groupId == before.groupId) &&
            System.currentTimeMillis() - refreshedAt < 60_000
        ) return@withLock
        mutableState.value = before.copy(busy = true, error = null)
        try {
            val rows = session.json(profile.scope, "$KUAN_API/groups/chat") as? JsonArray
                ?: throw KuanProtocolError("Invalid authorized group list")
            val groups = rows.mapNotNull { item ->
                val row = item as? JsonObject ?: return@mapNotNull null
                val id = row.long("id")?.takeIf { it > 0 } ?: return@mapNotNull null
                val name = row.string("name")?.takeIf(String::isNotBlank) ?: return@mapNotNull null
                KuanGroup(id, name, row.string("platform").orEmpty())
            }.distinctBy { it.id }
            val selected = groups.firstOrNull { it.id == (groupId ?: before.groupId) }
                ?: groups.firstOrNull().takeIf { groupId == null }
            mutableState.value = KuanCatalogState(groups, selected?.id, busy = true)
            val validIds = groups.mapTo(mutableSetOf()) { it.id }
            confirmed.value = confirmed.value.filterValues { it.kuanRoute()?.groupId in validIds }
            keyLock.withLock { keys.keys.removeAll { it.first != profile.scope || it.second !in validIds } }
            settings.update { current ->
                current.copy(providers = current.providers.filter { provider ->
                    val route = provider.kuanRoute()
                    route == null || route.scope == profile.scope && route.groupId in validIds
                })
            }
            if (groupId != null && selected == null) throw KuanHttpError(403, "GROUP_UNAVAILABLE")
            if (selected != null) {
                val key = key(profile.scope, selected.id, refresh = force)
                val payload = api.json("/v1/models?kuan_chat=1", bearer = key, envelope = false).asObject()
                val additions = managedModels(payload, profile.scope, selected, profile.admin)
                if (!session.isCurrent(profile.scope, epoch)) return@withLock
                confirmed.value = confirmed.value.filterValues { it.kuanRoute()?.groupId != selected.id } +
                    additions.associateBy { it.id }
                settings.update { current ->
                    val providers = current.providers.filterNot {
                        it.kuanRoute()?.let { route -> route.scope == profile.scope && route.groupId == selected.id } == true
                    } + additions
                    val currentId = current.getCurrentAssistant().chatModelId ?: current.chatModelId
                    val existing = current.findModelById(currentId)
                    val automatic = payload.array("data").orEmpty().mapNotNull { it as? JsonObject }
                        .firstOrNull { it.string("kuan_web_lane") == "auto" }?.string("id")
                    val candidates = additions.flatMap { it.models }.filter { it.type == ModelType.CHAT }
                    val default = candidates.firstOrNull { it.modelId == automatic } ?: candidates.firstOrNull()
                    val assistant = current.getCurrentAssistant()
                    if (existing != null || default == null) current.copy(providers = providers)
                    else current.copy(
                        providers = providers,
                        chatModelId = default.id,
                        assistants = current.assistants.map {
                            if (it.id == assistant.id) it.copy(chatModelId = default.id, providerReasoningEffort = null) else it
                        },
                    )
                }
                if (payload.obj("kuan_catalog")?.flag("stale") == true) {
                    mutableState.value = mutableState.value.copy(error = "Model catalog is temporarily stale")
                }
            }
            refreshedAt = System.currentTimeMillis()
        } catch (error: CancellationException) {
            throw error
        } catch (error: Exception) {
            val id = mutableState.value.groupId
            confirmed.value = confirmed.value.filterValues { it.kuanRoute()?.groupId != id }
            settings.update { current ->
                current.copy(providers = current.providers.map {
                    if (it.kuanRoute()?.groupId == id) it.copyProvider(enabled = false) else it
                })
            }
            mutableState.value = mutableState.value.copy(error = error.kuanUiMessage())
        } finally {
            mutableState.value = mutableState.value.copy(busy = false)
        }
    }

    suspend fun key(scope: String, groupId: Long, refresh: Boolean = false): String = keyLock.withLock {
        if (session.state.value.profile?.scope != scope || state.value.groups.none { it.id == groupId }) {
            throw KuanHttpError(403, "GROUP_UNAVAILABLE")
        }
        val mapKey = scope to groupId
        keys[mapKey]?.let { (value, expires) ->
            if (!refresh && expires > System.currentTimeMillis()) return@withLock value
        }
        val row = session.json(scope, "$KUAN_API/chat/api-key", "POST", buildJsonObject { put("group_id", groupId) }).asObject()
        if (row.long("group_id") != groupId || row.string("status") != "active") {
            throw KuanProtocolError("The API key is disabled or belongs to a different group")
        }
        val value = row.string("key")?.takeIf { it.isNotBlank() && it.length <= 4096 && it.none(Char::isWhitespace) }
            ?: throw KuanProtocolError("The group did not return a usable API key")
        keys[mapKey] = value to (System.currentTimeMillis() + 300_000)
        value
    }

    suspend fun resolve(provider: ProviderSetting.OpenAI, model: Model): Pair<KuanRoute, ProviderSetting.OpenAI> {
        val route = provider.kuanRoute() ?: throw KuanProtocolError("Invalid Kuan API route")
        if (route.providerId != provider.id || route.modelId(model.modelId) != model.id) {
            throw KuanProtocolError("Model and group do not match")
        }
        session.state.first { !it.loading }
        if (session.state.value.profile?.scope != route.scope) throw KuanHttpError(401)
        if (confirmed.value[route.providerId] == null) refresh(route.groupId, force = true)
        val valid = confirmed.value[route.providerId]
            ?.takeIf { it.kuanRoute() == route && it.models.any { m -> m.id == model.id } }
            ?: throw KuanProtocolError("This model is not in the active group catalog")
        val group = state.value.groups.firstOrNull { it.id == route.groupId } ?: throw KuanHttpError(403, "GROUP_UNAVAILABLE")
        val key = key(route.scope, route.groupId)
        return route to group.provider(route.scope, route.lane, valid.models).copy(apiKey = key)
    }
}

internal fun Throwable.kuanUiMessage(): String = when (this) {
    is KuanHttpError, is KuanProtocolError -> message ?: "Kuan API unavailable"
    else -> "Kuan API connection or device storage unavailable"
}
