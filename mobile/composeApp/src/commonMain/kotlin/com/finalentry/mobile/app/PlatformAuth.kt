package com.finalentry.mobile.app

/** Platform-specific Auth0 login and secure token storage. */
expect class PlatformAuth {
    fun loadBearerToken(): String?
    fun saveBearerToken(token: String?)
    suspend fun login(): Result<String>
    fun logout()
}
