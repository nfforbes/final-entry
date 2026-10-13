package com.finalentry.mobile.android.ui

import com.finalentry.mobile.model.MeResponseDto
import com.finalentry.mobile.model.UserProfileDto

internal val AppRoles = listOf("customer", "admin", "technician")

internal fun UserProfileDto.roleSet(): Set<String> = roleSet(roles, role)

internal fun MeResponseDto.roleSet(): Set<String> =
    roleSet(roles + (profile?.roles ?: emptyList()), role ?: profile?.role)

private fun roleSet(listed: List<String>, single: String?): Set<String> {
    val fromList = listed.map { it.lowercase() }.filter { it in AppRoles }.toMutableSet()
    val one = single?.lowercase()
    if (one != null && one in AppRoles) fromList += one
    return fromList
}

internal fun Set<String>.roleLabel(): String =
    AppRoles.filter { it in this }.joinToString(", ")
