package com.finalentry.mobile.app

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.finalentry.mobile.BearerTokenAccessor
import com.finalentry.mobile.FinalEntrySdk
import com.finalentry.mobile.SdkConfig
import com.finalentry.mobile.isUnauthorized
import com.finalentry.mobile.model.MeResponseDto
import kotlinx.coroutines.launch

@Composable
fun FinalEntryApp() {
    val auth = remember { createPlatformAuth() }
    val snack = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    var bearer by remember { mutableStateOf(auth.loadBearerToken().orEmpty()) }

    val sdk =
        remember(bearer) {
            val accessor = BearerTokenAccessor { bearer.trim().ifEmpty { null } }
            FinalEntrySdk(SdkConfig(AppConfig.API_BASE_URL, accessor))
        }

    var me by remember { mutableStateOf<MeResponseDto?>(null) }
    var loadErr by remember { mutableStateOf<String?>(null) }

    fun forceLogout() {
        auth.logout()
        bearer = ""
        me = null
        loadErr = null
    }

    suspend fun loadMe() {
        loadErr = null
        if (bearer.trim().isEmpty()) {
            me = null
            return
        }
        sdk.fetchMe().fold(
            onSuccess = {
                me = it
                loadErr = null
            },
            onFailure = {
                if (it.isUnauthorized()) {
                    forceLogout()
                    scope.launch { snack.showSnackbar("Session expired. Please log in again.") }
                } else {
                    me = null
                    loadErr = it.message ?: "Unauthorized"
                }
            },
        )
    }

    LaunchedEffect(bearer) { loadMe() }

    Scaffold(snackbarHost = { SnackbarHost(snack) }) { inset ->
        if (me == null) {
            Column(
                modifier =
                    Modifier
                        .padding(inset)
                        .fillMaxSize()
                        .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text("Final Entry", style = MaterialTheme.typography.headlineLarge)
                loadErr?.let {
                    Text(
                        it,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(top = 12.dp),
                    )
                }
                Button(
                    onClick = {
                        scope.launch {
                            auth.login()
                                .onSuccess { token ->
                                    bearer = token
                                    auth.saveBearerToken(token)
                                    loadErr = null
                                }
                                .onFailure { err ->
                                    loadErr = err.message ?: "Login failed"
                                }
                        }
                    },
                    modifier = Modifier.padding(top = 24.dp).fillMaxWidth(),
                ) {
                    Text("Login with Auth0")
                }
            }
        } else {
            val role = (me?.role ?: me?.profile?.role)?.trim()?.lowercase().orEmpty()
            Column(
                modifier =
                    Modifier
                        .padding(inset)
                        .fillMaxSize()
                        .padding(24.dp),
            ) {
                Text("Final Entry", style = MaterialTheme.typography.headlineLarge)
                Text(
                    if (role.isEmpty()) "Logged in" else "Logged in • $role",
                    modifier = Modifier.padding(vertical = 8.dp),
                )
                Text("API: ${AppConfig.API_BASE_URL}")
                me?.profile?.email?.let { Text(it) }
                loadErr?.let {
                    Text(it, color = MaterialTheme.colorScheme.error)
                }
                Button(
                    onClick = {
                        forceLogout()
                        scope.launch { snack.showSnackbar("Logged out") }
                    },
                    modifier = Modifier.padding(top = 16.dp),
                ) {
                    Text("Logout")
                }
            }
        }
    }
}
