package com.finalentry.mobile.app

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.forms.FormDataContent
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.Parameters
import io.ktor.serialization.kotlinx.json.json
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import platform.AuthenticationServices.ASWebAuthenticationPresentationContextProvidingProtocol
import platform.AuthenticationServices.ASWebAuthenticationSession
import platform.AuthenticationServices.ASPresentationAnchor
import platform.Foundation.NSCharacterSet
import platform.Foundation.NSString
import platform.Foundation.NSURL
import platform.Foundation.NSUserDefaults
import platform.Foundation.URLQueryAllowedCharacterSet
import platform.Foundation.stringByAddingPercentEncodingWithAllowedCharacters
import platform.UIKit.UIApplication
import platform.UIKit.UIWindow
import platform.darwin.NSObject
import kotlin.coroutines.resume

private const val TOKEN_KEY = "fe_bearer"

actual fun createPlatformAuth(): PlatformAuth = PlatformAuth()

actual class PlatformAuth {
    actual fun loadBearerToken(): String? = NSUserDefaults.standardUserDefaults.stringForKey(TOKEN_KEY)

    actual fun saveBearerToken(token: String?) {
        val prefs = NSUserDefaults.standardUserDefaults
        if (token.isNullOrBlank()) {
            prefs.removeObjectForKey(TOKEN_KEY)
        } else {
            prefs.setObject(token, TOKEN_KEY)
        }
    }

    actual suspend fun login(): Result<String> = IosAuth0.login()

    actual fun logout() {
        saveBearerToken(null)
    }
}

@OptIn(ExperimentalForeignApi::class)
private object IosAuth0 {
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun login(): Result<String> {
        val verifier = AuthPkce.randomVerifier()
        val challenge = AuthPkce.s256Challenge(verifier)
        val authUrl = buildAuthorizeUrl(challenge)

        val codeResult =
            suspendCancellableCoroutine { cont ->
                val session =
                    ASWebAuthenticationSession(
                        NSURL(string = authUrl),
                        "finalentry",
                    ) { callbackUrl, error ->
                        when {
                            error != null ->
                                cont.resume(Result.failure(Exception(error.localizedDescription)))
                            callbackUrl == null ->
                                cont.resume(Result.failure(Exception("Login cancelled")))
                            else -> {
                                val code = parseQueryParam(callbackUrl.absoluteString ?: "", "code")
                                if (code.isNullOrBlank()) {
                                    cont.resume(Result.failure(Exception("Missing authorization code")))
                                } else {
                                    cont.resume(Result.success(code))
                                }
                            }
                        }
                    }
                session.presentationContextProvider = AuthPresentationContext()
                if (!session.start()) {
                    cont.resume(Result.failure(Exception("Could not start Auth0 login session")))
                }
            }

        return codeResult.fold(
            onSuccess = { code -> exchangeCode(code, verifier) },
            onFailure = { Result.failure(it) },
        )
    }

    private suspend fun exchangeCode(code: String, verifier: String): Result<String> {
        return runCatching {
            val client =
                HttpClient {
                    install(ContentNegotiation) { json(json) }
                }
            try {
                val response =
                    client.post("https://${AppConfig.AUTH0_DOMAIN}/oauth/token") {
                        setBody(
                            FormDataContent(
                                Parameters.build {
                                    append("grant_type", "authorization_code")
                                    append("client_id", AppConfig.AUTH0_CLIENT_ID)
                                    append("code", code)
                                    append("redirect_uri", AppConfig.REDIRECT_URI)
                                    append("code_verifier", verifier)
                                },
                            ),
                        )
                    }
                val body = response.body<TokenResponse>()
                body.idToken?.takeIf { it.isNotBlank() }
                    ?: body.accessToken?.takeIf { it.isNotBlank() }
                    ?: error("Auth0 returned no token")
            } finally {
                client.close()
            }
        }
    }

    private fun buildAuthorizeUrl(challenge: String): String {
        fun enc(value: String): String =
            (value as NSString).stringByAddingPercentEncodingWithAllowedCharacters(
                NSCharacterSet.URLQueryAllowedCharacterSet,
            ) ?: value

        return buildString {
            append("https://${AppConfig.AUTH0_DOMAIN}/authorize?")
            append("client_id=${enc(AppConfig.AUTH0_CLIENT_ID)}")
            append("&redirect_uri=${enc(AppConfig.REDIRECT_URI)}")
            append("&response_type=code")
            append("&scope=${enc("openid profile email offline_access")}")
            append("&code_challenge=${enc(challenge)}")
            append("&code_challenge_method=S256")
        }
    }

    private fun parseQueryParam(url: String, key: String): String? {
        val query = url.substringAfter('?', "").substringBefore('#')
        for (part in query.split('&')) {
            val idx = part.indexOf('=')
            if (idx <= 0) continue
            if (part.substring(0, idx) == key) {
                return part.substring(idx + 1)
            }
        }
        return null
    }
}

@Serializable
private data class TokenResponse(
    @SerialName("access_token") val accessToken: String? = null,
    @SerialName("id_token") val idToken: String? = null,
)

@OptIn(ExperimentalForeignApi::class)
private class AuthPresentationContext :
    NSObject(),
    ASWebAuthenticationPresentationContextProvidingProtocol {
    override fun presentationAnchorForWebAuthenticationSession(session: ASWebAuthenticationSession): ASPresentationAnchor {
        val app = UIApplication.sharedApplication
        @Suppress("UNCHECKED_CAST")
        val window = app.keyWindow ?: app.windows.firstOrNull() as? UIWindow
        return window ?: ASPresentationAnchor()
    }
}
