package com.finalentry.mobile

fun interface BearerTokenAccessor {
    suspend operator fun invoke(): String?
}

data class SdkConfig(val baseUrl: String, val bearer: BearerTokenAccessor)
