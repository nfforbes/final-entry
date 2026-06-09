package com.finalentry.mobile.android.ui

import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

internal fun JsonElement?.asPrimitiveText(): String = (this as? JsonPrimitive)?.content.orEmpty()

internal fun JsonObject.mongoId(): String {
    val raw = this["_id"] ?: return ""
    return when (raw) {
        is JsonPrimitive -> raw.content
        is JsonObject -> raw["\$oid"]?.asPrimitiveText().orEmpty()
        else -> ""
    }
}

internal fun JsonObject.optText(key: String): String {
    val v = this[key] ?: return ""
    if (v is JsonPrimitive) return v.content
    if (v is JsonObject) return v["\$oid"]?.asPrimitiveText().orEmpty()
    return ""
}
