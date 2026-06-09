package com.finalentry.mobile.android.auth

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import net.openid.appauth.*
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine

object AuthConstants {
    const val AUTH0_DOMAIN = "n4consulting.us.auth0.com"
    const val AUTH0_CLIENT_ID = "VrzhxH5mE9gclkKHG5QOLhPivXFa1xNz"
    val AUTH0_CUSTOM_API_AUDIENCE: String? = null
    const val REDIRECT_URI = "finalentry://callback"
    const val PREFS_NAME = "finalentry_auth"
    const val KEY_ACCESS_TOKEN = "access_token"
    const val KEY_ID_TOKEN = "id_token"
    const val KEY_REFRESH_TOKEN = "refresh_token"
}

class AuthManager(private val context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        AuthConstants.PREFS_NAME,
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    val isLoggedIn: Boolean
        get() = !prefs.getString(AuthConstants.KEY_ACCESS_TOKEN, null).isNullOrBlank()

    val idToken: String?
        get() = prefs.getString(AuthConstants.KEY_ID_TOKEN, null)

    val accessToken: String?
        get() = prefs.getString(AuthConstants.KEY_ACCESS_TOKEN, null)

    private val serviceConfig = AuthorizationServiceConfiguration(
        Uri.parse("https://${AuthConstants.AUTH0_DOMAIN}/authorize"),
        Uri.parse("https://${ AuthConstants.AUTH0_DOMAIN}/oauth/token"),
    )

    fun buildAuthorizationRequest(): AuthorizationRequest {
        val b = AuthorizationRequest.Builder(
            serviceConfig,
            AuthConstants.AUTH0_CLIENT_ID,
            ResponseTypeValues.CODE,
            Uri.parse(AuthConstants.REDIRECT_URI),
        )
            .setScope("openid profile email offline_access")

        val apiAudience = AuthConstants.AUTH0_CUSTOM_API_AUDIENCE
        if (!apiAudience.isNullOrBlank()) {
            b.setAdditionalParameters(mapOf("audience" to apiAudience))
        }
        return b.build()
    }

    suspend fun exchangeCode(response: AuthorizationResponse): String = suspendCoroutine { cont ->
        val service = AuthorizationService(context)
        val tokenRequest = response.createTokenExchangeRequest()
        service.performTokenRequest(tokenRequest) { tokenResponse, ex ->
            if (tokenResponse != null) {
                saveTokens(tokenResponse)
                service.dispose()
                cont.resume(tokenResponse.idToken ?: "")
            } else {
                service.dispose()
                cont.resumeWithException(ex ?: Exception("Token exchange failed"))
            }
        }
    }

    private fun saveTokens(response: TokenResponse) {
        prefs.edit().apply {
            response.accessToken?.let { putString(AuthConstants.KEY_ACCESS_TOKEN, it) }
            response.idToken?.let { putString(AuthConstants.KEY_ID_TOKEN, it) }
            response.refreshToken?.let { putString(AuthConstants.KEY_REFRESH_TOKEN, it) }
        }.apply()
    }

    fun logout() {
        prefs.edit().apply {
            remove(AuthConstants.KEY_ACCESS_TOKEN)
            remove(AuthConstants.KEY_ID_TOKEN)
            remove(AuthConstants.KEY_REFRESH_TOKEN)
        }.apply()
    }

    fun buildLogoutIntent(): Intent {
        val returnTo = Uri.parse(AuthConstants.REDIRECT_URI)
        val logoutUrl = Uri.parse("https://${AuthConstants.AUTH0_DOMAIN}/v2/logout")
            .buildUpon()
            .appendQueryParameter("client_id", AuthConstants.AUTH0_CLIENT_ID)
            .appendQueryParameter("returnTo", returnTo.toString())
            .build()
        return Intent(Intent.ACTION_VIEW, logoutUrl)
    }
}
