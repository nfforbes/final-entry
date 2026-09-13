package com.finalentry.mobile.app

import kotlin.io.encoding.Base64
import kotlin.io.encoding.ExperimentalEncodingApi
import kotlin.random.Random
import org.kotlincrypto.hash.sha2.SHA256

internal object AuthPkce {
    fun randomVerifier(): String {
        val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
        return (1..64).map { chars[Random.nextInt(chars.length)] }.joinToString("")
    }

    @OptIn(ExperimentalEncodingApi::class)
    fun s256Challenge(verifier: String): String {
        val digest = SHA256().update(verifier.encodeToByteArray()).digest()
        return Base64.UrlSafe.encode(digest).trimEnd('=')
    }
}
