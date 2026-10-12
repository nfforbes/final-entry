package com.finalentry.mobile

class UnauthorizedException(message: String) : IllegalStateException(message)

/** True only for invalid/expired credentials (401), not permission errors (403). */
fun Throwable.isUnauthorized(): Boolean =
    when (this) {
        is UnauthorizedException -> true
        else -> message.orEmpty().contains("unauthorized", ignoreCase = true)
    }
