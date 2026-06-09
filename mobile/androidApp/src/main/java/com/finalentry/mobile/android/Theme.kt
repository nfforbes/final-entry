package com.finalentry.mobile.android

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val Dark =
    darkColorScheme(
        primary = androidx.compose.ui.graphics.Color(0xFFC6F135),
        onPrimary = androidx.compose.ui.graphics.Color(0xFF0B0B0F),
        background = androidx.compose.ui.graphics.Color(0xFF0B0B0F),
        onBackground = androidx.compose.ui.graphics.Color(0xFFF6F3EC),
    )

private val Light = lightColorScheme()

@Composable
fun FinalEntryTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = if (isSystemInDarkTheme()) Dark else Light, content = content)
}
