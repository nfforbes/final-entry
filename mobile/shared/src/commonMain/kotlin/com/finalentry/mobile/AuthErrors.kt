package com.finalentry.mobile

class UnauthorizedException(message: String) : IllegalStateException(message)

fun Throwable.isUnauthorized(): Boolean =
    when (this) {
        is UnauthorizedException -> true
        else -> {
            val msg = message.orEmpty()
            msg.contains("unauthorized", ignoreCase = true) ||
                msg.contains("401") ||
                msg.contains("403")
        }
    }
