package me.rerere.rikkahub.data.kuan

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.AtomicFile
import java.io.File
import java.io.FileNotFoundException
import java.security.KeyStore
import java.util.UUID
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import me.rerere.rikkahub.AppScope

internal data class KuanProfile(val id: Long, val email: String, val admin: Boolean, val balance: String?) {
    val scope: String get() = UUID.nameUUIDFromBytes("$KUAN_ORIGIN\n$id".encodeToByteArray()).toString()
}

internal data class KuanSessionState(
    val loading: Boolean = true,
    val profile: KuanProfile? = null,
    val epoch: Long = 0,
    val ownerBound: Boolean = false,
)
internal data class KuanAuthPolicy(
    val registration: Boolean,
    val verifyEmail: Boolean,
    val invitation: Boolean,
    val promo: Boolean,
    val externalChallenge: Boolean,
    val agreement: Boolean,
)

@Serializable
private class StoredLogin(
    val ownerId: Long,
    val access: String? = null,
    val refresh: String? = null,
    val expiresAt: Long = 0L,
)

private class SessionVault(context: Context) {
    private val blob = AtomicFile(File(context.noBackupFilesDir, "kuan-session.v1"))
    private val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    private val alias = "kuan.api.session.v1"
    private fun key(): SecretKey = (store.getKey(alias, null) as? SecretKey)
        ?: KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").run {
            init(KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .build())
            generateKey()
        }

    fun read(): StoredLogin? {
        val bytes = try { blob.readFully() } catch (_: FileNotFoundException) { return null }
        require(bytes.size in 29..65536)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, bytes.copyOfRange(0, 12)))
        return KuanJson.decodeFromString<StoredLogin>(cipher.doFinal(bytes, 12, bytes.size - 12).decodeToString())
    }

    fun write(login: StoredLogin) {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key())
        require(cipher.iv.size == 12)
        val bytes = cipher.iv + cipher.doFinal(KuanJson.encodeToString(login).encodeToByteArray())
        val out = blob.startWrite()
        try {
            out.write(bytes)
            blob.finishWrite(out)
        } catch (error: Exception) {
            blob.failWrite(out)
            throw error
        }
    }
}

internal class KuanSession(context: Context, appScope: AppScope, private val api: KuanApi) {
    private val vault by lazy { SessionVault(context.applicationContext) }
    private val mutex = Mutex()
    private val mutableState = MutableStateFlow(KuanSessionState())
    val state = mutableState.asStateFlow()
    private var login: StoredLogin? = null
    private var pendingTotp: String? = null
    private var vaultUnavailable = false

    init {
        appScope.launch(Dispatchers.IO) {
            mutex.withLock {
                try {
                    login = vault.read()
                } catch (_: Exception) {
                    vaultUnavailable = true
                }
                try {
                    if (login?.access != null) {
                        val profile = verifyLocked()
                        mutableState.value = KuanSessionState(false, profile, ownerBound = true)
                    }
                } catch (error: CancellationException) {
                    throw error
                } catch (_: Exception) {
                    // A network outage must not lock the user out of the local client.
                } finally {
                    mutableState.value = mutableState.value.copy(loading = false, ownerBound = login != null || vaultUnavailable)
                }
            }
        }
    }

    suspend fun policy(): KuanAuthPolicy {
        val data = api.json("$KUAN_API/settings/public").asObject()
        return KuanAuthPolicy(
            registration = data.flag("registration_enabled"),
            verifyEmail = data.flag("email_verify_enabled"),
            invitation = data.flag("invitation_code_enabled"),
            promo = data.flag("promo_code_enabled"),
            externalChallenge = data.flag("turnstile_enabled") || data.flag("tencent_captcha_enabled"),
            agreement = data.flag("login_agreement_enabled"),
        )
    }

    suspend fun sendVerification(email: String) {
        api.json("$KUAN_API/auth/send-verify-code", "POST", body = buildJsonObject { put("email", email) })
    }

    suspend fun signIn(email: String, password: String): Boolean = authenticate(
        "/auth/login",
        buildJsonObject {
            put("email", email)
            put("password", password)
        },
    )

    suspend fun register(email: String, password: String, emailCode: String, invitation: String, promo: String): Boolean =
        authenticate("/auth/register", buildJsonObject {
            put("email", email)
            put("password", password)
            if (emailCode.isNotBlank()) put("verify_code", emailCode)
            if (invitation.isNotBlank()) put("invitation_code", invitation)
            if (promo.isNotBlank()) put("promo_code", promo)
        })

    suspend fun finishTotp(code: String) = withContext(Dispatchers.IO) {
        mutex.withLock {
            val temp = pendingTotp ?: throw KuanProtocolError("Sign in again to restart verification")
            val data = api.json("$KUAN_API/auth/login/2fa", "POST", body = buildJsonObject {
                put("temp_token", temp)
                put("totp_code", code)
            }).asObject()
            completeLocked(data)
        }
    }

    private suspend fun authenticate(path: String, body: JsonObject): Boolean = withContext(Dispatchers.IO) {
        mutex.withLock {
            check(!vaultUnavailable) { "This device could not open its saved account" }
            pendingTotp = null
            val data = api.json("$KUAN_API$path", "POST", body = body).asObject()
            if (data.flag("requires_2fa")) {
                pendingTotp = data.string("temp_token") ?: throw KuanProtocolError("Missing verification token")
                true
            } else {
                completeLocked(data)
                false
            }
        }
    }

    private suspend fun completeLocked(data: JsonObject) {
        val token = data.string("access_token")?.takeIf(String::isNotBlank)
            ?: throw KuanProtocolError("Sign-in did not return a session")
        val profile = fetchProfile(token)
        if (login?.ownerId?.let { it != profile.id } == true) {
            throw KuanProtocolError("This local profile is bound to another Kuan API account")
        }
        saveLocked(fromResponse(profile.id, data))
        pendingTotp = null
        mutableState.value = KuanSessionState(false, profile, mutableState.value.epoch + 1, ownerBound = true)
    }

    private fun fromResponse(ownerId: Long, data: JsonObject): StoredLogin {
        val token = data.string("access_token")?.takeIf(String::isNotBlank)
            ?: throw KuanProtocolError("Missing access token")
        val duration = data.long("expires_in")?.coerceIn(0, 30 * 24 * 3600L) ?: 0L
        return StoredLogin(
            ownerId, token, data.string("refresh_token")?.takeIf(String::isNotBlank),
            if (duration == 0L) 0L else System.currentTimeMillis() + duration * 1000L,
        )
    }

    private fun saveLocked(value: StoredLogin) {
        vault.write(value)
        login = value
    }

    private suspend fun refreshLocked(failedAccess: String? = null): StoredLogin {
        val previous = login ?: throw KuanHttpError(401)
        if (failedAccess != null && failedAccess != previous.access) return previous
        val refresh = previous.refresh ?: throw KuanHttpError(401)
        val data = api.json("$KUAN_API/auth/refresh", "POST", body = buildJsonObject {
            put("refresh_token", refresh)
        }).asObject()
        return fromResponse(previous.ownerId, data).also(::saveLocked)
    }

    private suspend fun accessLocked(): String {
        val snapshot = login ?: throw KuanHttpError(401)
        if (snapshot.expiresAt > 0 && snapshot.refresh != null && snapshot.expiresAt < System.currentTimeMillis() + 30000) {
            return refreshLocked().access ?: throw KuanHttpError(401)
        }
        return snapshot.access ?: throw KuanHttpError(401)
    }

    private suspend fun fetchProfile(token: String): KuanProfile {
        val profile = api.json("$KUAN_API/auth/me", bearer = token).asObject()
        val id = profile.long("id")?.takeIf { it > 0 } ?: throw KuanProtocolError("Account identity is missing")
        val email = profile.string("email").orEmpty()
        return KuanProfile(id, email, profile.string("role") == "admin", profile.string("balance"))
    }

    private suspend fun verifyLocked(): KuanProfile {
        val access = accessLocked()
        val profile = try {
            fetchProfile(access)
        } catch (error: KuanHttpError) {
            if (error.status != 401) throw error
            fetchProfile(refreshLocked(access).access ?: throw KuanHttpError(401))
        }
        if (profile.id != login?.ownerId) throw KuanProtocolError("Account identity changed")
        return profile
    }

    suspend fun profile(): KuanProfile = withContext(Dispatchers.IO) {
        mutex.withLock {
            verifyLocked().also { mutableState.value = mutableState.value.copy(loading = false, profile = it) }
        }
    }

    suspend fun signOut() = withContext(Dispatchers.IO) {
        val old = mutex.withLock {
            val refresh = login?.refresh
            login?.let { saveLocked(StoredLogin(it.ownerId)) }
            pendingTotp = null
            mutableState.value = mutableState.value.copy(loading = false, profile = null, epoch = mutableState.value.epoch + 1)
            refresh
        }
        if (old != null) {
            try {
                api.json("$KUAN_API/auth/logout", "POST", body = buildJsonObject { put("refresh_token", old) })
            } catch (error: CancellationException) {
                throw error
            } catch (_: Exception) {
                // Local session data has already been revoked. The web session may expire separately.
            }
        }
    }

    suspend fun <T> authorized(scope: String, replaySafe: Boolean = false, block: suspend (String) -> T): T {
        val (epoch, access) = withContext(Dispatchers.IO) {
            mutex.withLock {
                if (mutableState.value.profile?.scope != scope) throw KuanHttpError(401)
                mutableState.value.epoch to accessLocked()
            }
        }
        val result = try {
            block(access)
        } catch (error: KuanHttpError) {
            if (error.status != 401 || !replaySafe) throw error
            val refreshed = withContext(Dispatchers.IO) {
                mutex.withLock {
                    if (!isCurrent(scope, epoch)) throw KuanHttpError(401)
                    refreshLocked(access).access ?: throw KuanHttpError(401)
                }
            }
            block(refreshed)
        }
        if (!isCurrent(scope, epoch)) throw KuanHttpError(401)
        return result
    }

    fun isCurrent(scope: String, epoch: Long): Boolean =
        mutableState.value.let { it.profile?.scope == scope && it.epoch == epoch }

    suspend fun json(
        scope: String,
        path: String,
        method: String = "GET",
        body: JsonObject? = null,
        headers: Map<String, String> = emptyMap(),
        limit: Long = 4L * 1024 * 1024,
    ): JsonElement = authorized(scope, replaySafe = method == "GET") {
        api.json(path, method, it, body, headers = headers, limit = limit)
    }
}
