package me.rerere.rikkahub.data.kuan

import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.longOrNull
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.add

internal data class KuanAdminGroups(val available: List<KuanGroup>, val configured: Set<Long>)

internal class KuanOperations(private val session: KuanSession) {
    suspend fun usage() = session.profile().let { account ->
        session.json(account.scope, "$KUAN_API/usage/dashboard/stats").asObject()
    }

    suspend fun adminStats(): JsonObject = session.json(
        requireAdmin().scope, "$KUAN_API/admin/dashboard/stats",
    ).asObject()

    suspend fun adminGroups(): KuanAdminGroups {
        val account = requireAdmin()
        val configured = session.json(account.scope, "$KUAN_API/admin/settings/chat-groups").asObject()
            .array("group_ids") ?: throw KuanProtocolError("Invalid group settings response")
        val groups = session.json(account.scope, "$KUAN_API/admin/groups/all") as? JsonArray
            ?: throw KuanProtocolError("Invalid administrator group directory")
        return KuanAdminGroups(
            available = groups.mapNotNull { element ->
                val row = element as? JsonObject ?: return@mapNotNull null
                val id = row.long("id")?.takeIf { it > 0 } ?: return@mapNotNull null
                KuanGroup(id, row.string("name") ?: return@mapNotNull null, row.string("platform").orEmpty())
            },
            configured = configured.mapNotNull { (it as? JsonPrimitive)?.longOrNull }.toSet(),
        )
    }

    suspend fun saveAdminGroups(selection: Set<Long>): Set<Long> {
        val account = requireAdmin()
        val result = session.json(
            account.scope, "$KUAN_API/admin/settings/chat-groups", "PUT",
            buildJsonObject { putJsonArray("group_ids") { selection.sorted().forEach { add(it) } } },
        ).asObject().array("group_ids") ?: throw KuanProtocolError("Group settings were not confirmed")
        return result.mapNotNull { (it as? JsonPrimitive)?.longOrNull }.toSet()
    }

    private suspend fun requireAdmin() = session.profile().also {
        if (!it.admin) throw KuanHttpError(403, "ADMIN_REQUIRED")
    }
}
