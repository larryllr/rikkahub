package me.rerere.rikkahub.data.kuan

import java.math.BigDecimal
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.longOrNull
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.add
import kotlinx.serialization.json.put

internal data class KuanAdminGroups(val available: List<KuanGroup>, val configured: Set<Long>)
internal data class KuanWebAccount(
    val id: Long, val plan: String, val enabled: Boolean, val eligible: Boolean, val activeRequests: Int,
)
internal data class KuanWebAccounts(val revision: String, val accounts: List<KuanWebAccount>)
internal data class KuanBillingModel(val id: String, val name: String, val efforts: List<String>)
internal data class KuanBillingPrice(val multiplier: String, val minimum: String)
internal data class KuanBilling(val revision: String, val models: List<KuanBillingModel>, val policy: JsonObject) {
    fun price(model: String, effort: String): KuanBillingPrice {
        val rules = policy.array("rules").orEmpty().mapNotNull { it as? JsonObject }
        val selected = rules.firstOrNull { it.string("model") == model && it.string("effort").orEmpty() == effort }
            ?: rules.firstOrNull { it.string("model") == model && it.string("effort").isNullOrEmpty() }
            ?: policy.obj("default")
            ?: throw KuanProtocolError("Missing pricing defaults")
        return KuanBillingPrice(selected.string("multiplier").orEmpty(), selected.string("minimum_usd").orEmpty())
    }
}

internal class KuanOperations(private val session: KuanSession, private val api: KuanApi) {
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

    suspend fun webAccounts(): KuanWebAccounts = readWebAccounts(adminApi("web-accounts"))

    suspend fun setWebAccount(current: KuanWebAccounts, id: Long, enabled: Boolean): KuanWebAccounts {
        require(current.accounts.any { it.id == id })
        val result = adminApi("web-accounts", buildJsonObject {
            put("account_id", id)
            put("revision", current.revision)
            put("enabled", enabled)
        })
        return readWebAccounts(result)
    }

    suspend fun billing(): KuanBilling = readBilling(adminApi("chat-billing"))

    suspend fun savePrice(
        current: KuanBilling, model: String, effort: String, price: KuanBillingPrice,
    ): KuanBilling {
        val supported = current.models.firstOrNull { it.id == model }
            ?: throw KuanProtocolError("Select a model offered by the server")
        if (effort.isNotEmpty() && effort !in supported.efforts) throw KuanProtocolError("Unsupported reasoning effort")
        val row = buildJsonObject {
            put("model", model)
            put("effort", effort)
            put("multiplier", validatedPrice(price.multiplier))
            put("minimum_usd", validatedPrice(price.minimum))
        }
        val rules = current.policy.array("rules") ?: throw KuanProtocolError("Missing model prices")
        val next = rules.filterNot {
            val existing = it as? JsonObject
            existing?.string("model") == model && existing.string("effort").orEmpty() == effort
        } + row
        val data = adminApi("chat-billing", buildJsonObject {
            put("revision", current.revision)
            put("policy", JsonObject(current.policy + ("rules" to JsonArray(next))))
        })
        return readBilling(data)
    }

    private suspend fun adminApi(resource: String, body: JsonObject? = null): JsonObject {
        val admin = requireAdmin()
        return session.authorized(admin.scope, replaySafe = body == null) { token ->
            api.json("$KUAN_API/kuan/$resource", if (body == null) "GET" else "POST", token, body, envelope = false).asObject()
        }
    }

    private fun readWebAccounts(data: JsonObject): KuanWebAccounts {
        val rows = data.array("accounts") ?: throw KuanProtocolError("Missing scheduling accounts")
        return KuanWebAccounts(data.requiredRevision(), rows.mapNotNull { entry ->
            val row = entry as? JsonObject ?: return@mapNotNull null
            val id = row.long("id") ?: return@mapNotNull null
            KuanWebAccount(
                id, row.string("plan_type").orEmpty(), row.flag("enabled"), row.flag("eligible"),
                row.int("active_requests")?.coerceAtLeast(0) ?: 0,
            )
        })
    }

    private fun readBilling(data: JsonObject): KuanBilling {
        val rows = data.array("models") ?: throw KuanProtocolError("Missing model prices")
        val policy = data.obj("policy") ?: throw KuanProtocolError("Missing pricing configuration")
        return KuanBilling(data.requiredRevision(), rows.mapNotNull { entry ->
            val row = entry as? JsonObject ?: return@mapNotNull null
            val id = row.string("id") ?: return@mapNotNull null
            val efforts = row.array("supported_reasoning_levels").orEmpty().mapNotNull { (it as? JsonObject)?.string("effort") }
            KuanBillingModel(id, row.string("display_name") ?: id, efforts)
        }, policy)
    }

    private fun JsonObject.requiredRevision() = string("revision")?.takeIf { it.matches(Regex("[a-f0-9]{64}")) }
        ?: throw KuanProtocolError("Missing settings revision")

    private fun validatedPrice(raw: String): String {
        val amount = raw.trim().takeIf { it.matches(Regex("[0-9]{1,4}(\\.[0-9]{1,8})?")) }?.toBigDecimalOrNull()
        if (amount == null || amount < BigDecimal.ZERO || amount > BigDecimal("1000")) {
            throw KuanProtocolError("Enter a number between 0 and 1,000 with up to 8 decimal places")
        }
        return amount.stripTrailingZeros().toPlainString()
    }

    private suspend fun requireAdmin() = session.profile().also {
        if (!it.admin) throw KuanHttpError(403, "ADMIN_REQUIRED")
    }
}
