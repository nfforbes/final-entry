package com.finalentry.mobile.android.ui

import android.app.Activity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.finalentry.mobile.BearerTokenAccessor
import com.finalentry.mobile.FinalEntrySdk
import com.finalentry.mobile.SdkConfig
import com.finalentry.mobile.android.R
import com.finalentry.mobile.android.auth.AuthManager
import com.finalentry.mobile.model.MeResponseDto
import kotlinx.coroutines.launch
import net.openid.appauth.AuthorizationException
import net.openid.appauth.AuthorizationResponse
import net.openid.appauth.AuthorizationService

private const val API_BASE_URL = "https://final-entry.vercel.app"

@Composable
fun FinalEntryRoot() {
    val context = LocalContext.current
    val snack = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    val apiBase = API_BASE_URL
    val authManager = remember { AuthManager(context) }
    var bearer by remember { mutableStateOf(authManager.bearerToken().orEmpty()) }

    val sdk =
        remember(apiBase, bearer) {
            val accessor = BearerTokenAccessor { bearer.trim().ifEmpty { null } }
            FinalEntrySdk(SdkConfig(apiBase.trim(), accessor))
        }

    var me by remember { mutableStateOf<MeResponseDto?>(null) }
    var loadErr by remember { mutableStateOf<String?>(null) }

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
                me = null
                loadErr = it.message ?: "Unauthorized"
            },
        )
    }

    val loginLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult(),
    ) { result ->
        val data = result.data
        if (result.resultCode != Activity.RESULT_OK) {
            loadErr =
                when {
                    data == null -> "Login cancelled"
                    else -> {
                        val error = AuthorizationException.fromIntent(data)
                        error?.errorDescription
                            ?: error?.error
                            ?: "Login failed (code ${result.resultCode})"
                    }
                }
            return@rememberLauncherForActivityResult
        }
        if (data == null) {
            loadErr = "Login finished without a response"
            return@rememberLauncherForActivityResult
        }
        val response = AuthorizationResponse.fromIntent(data)
        val error = AuthorizationException.fromIntent(data)
        when {
            response != null ->
                scope.launch {
                    try {
                        bearer = authManager.exchangeCode(response)
                        loadErr = null
                    } catch (e: Exception) {
                        loadErr = "Token exchange failed: ${e.message}"
                    }
                }
            error != null ->
                loadErr = "Auth error: ${error.errorDescription ?: error.error ?: "Unknown error"}"
            else -> loadErr = "Login failed: no authorization response"
        }
    }

    LaunchedEffect(apiBase, bearer) { loadMe() }

    Scaffold(snackbarHost = { SnackbarHost(snack) }) { inset ->
        if (me == null) {
            Box(modifier = Modifier.fillMaxSize()) {
                Image(
                    painter = painterResource(id = R.drawable.fumigation_bg),
                    contentDescription = "Fumigation Background",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.5f))
                )
                Column(
                    modifier = Modifier
                        .padding(inset)
                        .fillMaxSize()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("Final Entry", style = MaterialTheme.typography.headlineLarge, color = Color.White)

                    loadErr?.let { 
                        Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 16.dp)) 
                    }

                    Button(
                        onClick = {
                            val request = authManager.buildAuthorizationRequest()
                            val authService = AuthorizationService(context)
                            val authIntent = authService.getAuthorizationRequestIntent(request)
                            loginLauncher.launch(authIntent)
                        },
                        enabled = apiBase.isNotBlank(),
                        modifier = Modifier.padding(top = 24.dp)
                    ) {
                        Text("Login")
                    }
                }
            }
        } else {
            Column(
                Modifier
                    .padding(inset)
                    .fillMaxSize(),
            ) {
                val role = (me?.role ?: me?.profile?.role)?.trim()?.lowercase().orEmpty()

                Row(
                    modifier = Modifier.fillMaxWidth().padding(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Final Entry", style = MaterialTheme.typography.headlineSmall)
                        Text(
                            text = when {
                                role.isEmpty() -> "Role unknown."
                                else -> "Logged in • $role"
                            },
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }

                    var expanded by remember { mutableStateOf(false) }
                    val nameStr = me?.profile?.name.orEmpty()
                    val initials = if (nameStr.isNotBlank()) nameStr.take(1).uppercase() else "U"
                    
                    Box {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .background(MaterialTheme.colorScheme.primary, shape = CircleShape)
                                .clickable { expanded = true },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(initials, color = MaterialTheme.colorScheme.onPrimary, style = MaterialTheme.typography.titleMedium)
                        }

                        DropdownMenu(
                            expanded = expanded,
                            onDismissRequest = { expanded = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Logout") },
                                onClick = {
                                    expanded = false
                                    bearer = ""
                                    me = null
                                    authManager.logout()
                                    scope.launch { snack.showSnackbar("Logged out successfully") }
                                }
                            )
                        }
                    }
                }

                loadErr?.let { Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(horizontal = 16.dp)) }

                Box(modifier = Modifier.weight(1f)) {
                    when (role) {
                        "customer" ->
                            CustomerPortal(
                                sdk = sdk,
                                me = checkNotNull(me),
                                snack = snack,
                                onForgetToken = {
                                    bearer = ""
                                    me = null
                                    authManager.logout()
                                    scope.launch { snack.showSnackbar("Logged out successfully") }
                                },
                            )

                        "admin" -> AdminPortal(sdk = sdk, snack = snack)
                        "technician" -> TechnicianPortal(sdk = sdk, snack = snack)
                        else -> Text("Role \"$role\" is not routed. Complete an invite or login once on web.", modifier = Modifier.padding(16.dp))
                    }
                }
            }
        }
    }
}
