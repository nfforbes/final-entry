package com.finalentry.mobile.android.ui

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.PendingActions
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import com.finalentry.mobile.FinalEntrySdk
import com.finalentry.mobile.model.AdminJobPatchBody
import com.finalentry.mobile.model.DashboardStatWireDto
import com.finalentry.mobile.model.UserProfileDto
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

private val prettyJson =
    Json {
        prettyPrint = true
        ignoreUnknownKeys = true
    }

private fun JsonObject.primitive(key: String): String? =
    when (val v = this[key]) {
        is JsonPrimitive -> v.content.takeIf { it.isNotBlank() }
        else -> null
    }

private fun JsonObject.nested(key: String): JsonObject? = this[key] as? JsonObject

@Composable
fun AdminPortal(
    sdk: FinalEntrySdk,
    snack: SnackbarHostState,
    onAuthFailure: () -> Unit,
) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()

    var stats by remember { mutableStateOf<List<DashboardStatWireDto>>(emptyList()) }
    var jobs by remember { mutableStateOf<List<JsonObject>>(emptyList()) }
    var users by remember { mutableStateOf<List<UserProfileDto>>(emptyList()) }
    var integrations by remember { mutableStateOf<JsonObject?>(null) }
    var integrationPretty by remember { mutableStateOf("") }
    var googleConnectUrl by remember { mutableStateOf("") }
    var microsoftConnectUrl by remember { mutableStateOf("") }

    var inviteEmail by remember { mutableStateOf("") }
    var inviteRole by remember { mutableStateOf("technician") }
    var showInviteDialog by remember { mutableStateOf(false) }
    var userSearchQuery by remember { mutableStateOf("") }
    var userRoleFilter by remember { mutableStateOf("All") }
    var orderSearchQuery by remember { mutableStateOf("") }
    var orderStatusFilter by remember { mutableStateOf("All") }
    
    var msTenantId by remember { mutableStateOf("") }
    var msClientId by remember { mutableStateOf("") }
    var msClientSecret by remember { mutableStateOf("") }
    
    var googleClientId by remember { mutableStateOf("") }
    var googleClientSecret by remember { mutableStateOf("") }
    
    var testEmailAddress by remember { mutableStateOf("") }

    LaunchedEffect(integrations) {
        val i = integrations
        if (i != null) {
            val msConfig = i.nested("microsoft")?.nested("config")
            if (msConfig != null) {
                msTenantId = msConfig.optText("tenantId")
                msClientId = msConfig.optText("clientId")
                val sec = msConfig.optText("clientSecret")
                if (sec.isNotBlank()) msClientSecret = sec
            }
            val gConfig = i.nested("google")?.nested("config")
            if (gConfig != null) {
                googleClientId = gConfig.optText("clientId")
                val sec = gConfig.optText("clientSecret")
                if (sec.isNotBlank()) googleClientSecret = sec
            }
        }
    }

    var selectedTab by remember { mutableStateOf("Dashboard") }

    suspend fun reload() {
        sdk.fetchAdminStats()
            .onSuccess { envelope -> stats = envelope.stats }
            .onFailure { err -> snack.handleSdkFailureSuspending(err, onAuthFailure, "Dashboard failed") }

        sdk.fetchAdminJobs()
            .onSuccess { envelope ->
                jobs =
                    envelope.jobs.mapNotNull { element ->
                        runCatching { element as JsonObject }.getOrNull()
                    }
            }
            .onFailure { err -> snack.handleSdkFailureSuspending(err, onAuthFailure, "Jobs failed") }

        sdk.fetchAdminUsers(null)
            .onSuccess { envelope -> users = envelope.users }
            .onFailure { err -> snack.handleSdkFailureSuspending(err, onAuthFailure, "Users failed") }

        sdk.fetchIntegrationStatus()
            .onSuccess { obj ->
                integrations = obj
                integrationPretty = runCatching { prettyJson.encodeToString(obj) }.getOrElse { "{}" }
                val urls = obj.nested("connectUrls")
                googleConnectUrl = urls?.primitive("googleAuth").orEmpty()
                microsoftConnectUrl = urls?.primitive("microsoftAuth").orEmpty()
            }
            .onFailure { err -> snack.handleSdkFailureSuspending(err, onAuthFailure, "Integrations failed") }
    }

    LaunchedEffect(Unit) { reload() }

    Column(modifier = Modifier.fillMaxSize()) {
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(8.dp)
        ) {
            Column {
                Button(
                    onClick = { scope.launch { reload() } },
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                ) {
                    Text("Refresh all")
                }

                when (selectedTab) {
                    "Dashboard" -> {
                        Text("Dashboard", style = MaterialTheme.typography.titleLarge)
                        Spacer(modifier = Modifier.height(8.dp))
                        if (stats.isEmpty()) {
                            Text("No stats yet (or still loading)")
                        }
                        
                        val totalOrders = stats.find { it.label.contains("Orders", true) }?.value ?: "0"
                        val activeUsers = stats.find { it.label.contains("Users", true) }?.value ?: "0"
                        val revenue = stats.find { it.label.contains("Revenue", true) }?.value ?: "$0.00"
                        val pendingQuotes = stats.find { it.label.contains("Pending", true) }?.value ?: "0"
                        
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Card(modifier = Modifier.weight(1f)) {
                                Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                    Icon(Icons.Default.ShoppingCart, contentDescription = "Total Orders", modifier = Modifier.size(32.dp), tint = MaterialTheme.colorScheme.primary)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text("Total Orders", style = MaterialTheme.typography.bodySmall)
                                    Text(totalOrders, style = MaterialTheme.typography.titleLarge)
                                }
                            }
                            Card(modifier = Modifier.weight(1f)) {
                                Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                    Icon(Icons.Default.People, contentDescription = "Active Users", modifier = Modifier.size(32.dp), tint = MaterialTheme.colorScheme.primary)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text("Active Users", style = MaterialTheme.typography.bodySmall)
                                    Text(activeUsers, style = MaterialTheme.typography.titleLarge)
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Card(modifier = Modifier.weight(1f)) {
                                Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                    Icon(Icons.Default.AttachMoney, contentDescription = "Revenue", modifier = Modifier.size(32.dp), tint = MaterialTheme.colorScheme.primary)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text("Revenue", style = MaterialTheme.typography.bodySmall)
                                    Text(revenue, style = MaterialTheme.typography.titleLarge)
                                }
                            }
                            Card(modifier = Modifier.weight(1f)) {
                                Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                    Icon(Icons.Default.PendingActions, contentDescription = "Pending Quotes", modifier = Modifier.size(32.dp), tint = MaterialTheme.colorScheme.primary)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text("Pending Quotes", style = MaterialTheme.typography.bodySmall)
                                    Text(pendingQuotes, style = MaterialTheme.typography.titleLarge)
                                }
                            }
                        }
                    }
                    "Users" -> {
                        if (showInviteDialog) {
                            AlertDialog(
                                onDismissRequest = { showInviteDialog = false },
                                title = { Text("Invite User") },
                                text = {
                                    Column {
                                        OutlinedTextField(
                                            value = inviteEmail,
                                            onValueChange = { inviteEmail = it },
                                            modifier = Modifier.fillMaxWidth(),
                                            label = { Text("Email") },
                                            singleLine = true,
                                        )
                                        OutlinedTextField(
                                            value = inviteRole,
                                            onValueChange = { inviteRole = it.lowercase().trim() },
                                            modifier = Modifier.fillMaxWidth(),
                                            label = { Text("Role (customer|technician|admin)") },
                                            singleLine = true,
                                        )
                                    }
                                },
                                confirmButton = {
                                    Button(onClick = {
                                        scope.launch {
                                            val email = inviteEmail.trim()
                                            if (email.isEmpty()) {
                                                snack.showSnackbar("Email required")
                                                return@launch
                                            }
                                            sdk.inviteUser(email, inviteRole.ifBlank { "technician" })
                                                .onSuccess {
                                                    snack.showSnackbar("Invite sent")
                                                    inviteEmail = ""
                                                    showInviteDialog = false
                                                    reload()
                                                }
                                                .onFailure { err -> handleSdkFailure(err, snack, onAuthFailure, "Invite failed") }
                                        }
                                    }) { Text("Send") }
                                },
                                dismissButton = {
                                    TextButton(onClick = { showInviteDialog = false }) { Text("Cancel") }
                                }
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Users (${users.size})", style = MaterialTheme.typography.titleLarge)
                            IconButton(onClick = { showInviteDialog = true }) {
                                Icon(Icons.Default.PersonAdd, contentDescription = "Add User")
                            }
                        }

                        OutlinedTextField(
                            value = userSearchQuery,
                            onValueChange = { userSearchQuery = it },
                            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                            label = { Text("Search by name or email") },
                            singleLine = true,
                            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search") }
                        )

                        var roleFilterExpanded by remember { mutableStateOf(false) }
                        Box(modifier = Modifier.padding(bottom = 8.dp)) {
                            TextButton(onClick = { roleFilterExpanded = true }) {
                                Text("Filter Role: $userRoleFilter")
                            }
                            DropdownMenu(expanded = roleFilterExpanded, onDismissRequest = { roleFilterExpanded = false }) {
                                listOf("All", "customer", "technician", "admin").forEach { r ->
                                    DropdownMenuItem(
                                        text = { Text(r.replaceFirstChar { it.uppercase() }) },
                                        onClick = {
                                            userRoleFilter = r
                                            roleFilterExpanded = false
                                        }
                                    )
                                }
                            }
                        }

                        val filteredUsers = users.filter { u ->
                            val matchesSearch = userSearchQuery.isBlank() || 
                                u.name?.contains(userSearchQuery, ignoreCase = true) == true ||
                                u.email?.contains(userSearchQuery, ignoreCase = true) == true
                            val matchesRole = userRoleFilter == "All" || u.role?.equals(userRoleFilter, ignoreCase = true) == true
                            matchesSearch && matchesRole
                        }

                        if (filteredUsers.isEmpty()) {
                            Text("No users match the filter criteria.", modifier = Modifier.padding(vertical = 16.dp))
                        }

                        filteredUsers.forEach { user ->
                            val uid = user.id.orEmpty().ifBlank { user.auth0Id.orEmpty() }
                            var expanded by remember { mutableStateOf(false) }

                            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier.weight(0.3f),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth(0.8f)
                                                .aspectRatio(1f)
                                                .clip(CircleShape)
                                                .background(MaterialTheme.colorScheme.surfaceVariant),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(
                                                Icons.Default.Person,
                                                contentDescription = "User Image",
                                                modifier = Modifier.padding(16.dp)
                                            )
                                        }
                                    }

                                    Column(modifier = Modifier.weight(0.6f).padding(horizontal = 8.dp)) {
                                        Text(user.name ?: "Unknown Name", style = MaterialTheme.typography.bodyLarge)
                                        Text(user.email ?: "No email", style = MaterialTheme.typography.bodyMedium)
                                        Text(user.role ?: "No role", style = MaterialTheme.typography.labelMedium)
                                    }

                                    Box(modifier = Modifier.weight(0.1f)) {
                                        IconButton(onClick = { expanded = true }) {
                                            Icon(Icons.Default.MoreVert, contentDescription = "Options")
                                        }
                                        DropdownMenu(
                                            expanded = expanded,
                                            onDismissRequest = { expanded = false }
                                        ) {
                                            DropdownMenuItem(
                                                text = { Text("Make Customer") },
                                                onClick = {
                                                    expanded = false
                                                    scope.launch {
                                                        sdk.patchUserRole(uid, "customer")
                                                            .onSuccess { reload() }
                                                            .onFailure { err -> handleSdkFailure(err, snack, onAuthFailure, "Failed") }
                                                    }
                                                }
                                            )
                                            DropdownMenuItem(
                                                text = { Text("Make Technician") },
                                                onClick = {
                                                    expanded = false
                                                    scope.launch {
                                                        sdk.patchUserRole(uid, "technician")
                                                            .onSuccess { reload() }
                                                            .onFailure { err -> handleSdkFailure(err, snack, onAuthFailure, "Failed") }
                                                    }
                                                }
                                            )
                                            DropdownMenuItem(
                                                text = { Text("Make Admin") },
                                                onClick = {
                                                    expanded = false
                                                    scope.launch {
                                                        sdk.patchUserRole(uid, "admin")
                                                            .onSuccess { reload() }
                                                            .onFailure { err -> handleSdkFailure(err, snack, onAuthFailure, "Failed") }
                                                    }
                                                }
                                            )
                                            DropdownMenuItem(
                                                text = { Text("Delete User") },
                                                onClick = {
                                                    expanded = false
                                                    scope.launch {
                                                        sdk.deleteAdminUser(uid)
                                                            .onSuccess { reload() }
                                                            .onFailure { err -> handleSdkFailure(err, snack, onAuthFailure, "Failed") }
                                                    }
                                                }
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                    "Orders" -> {
                        Text("Jobs", style = MaterialTheme.typography.titleLarge)
                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = orderSearchQuery,
                            onValueChange = { orderSearchQuery = it },
                            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                            label = { Text("Search by customer name") },
                            singleLine = true,
                            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search") }
                        )

                        var statusFilterExpanded by remember { mutableStateOf(false) }
                        Box(modifier = Modifier.padding(bottom = 8.dp)) {
                            TextButton(onClick = { statusFilterExpanded = true }) {
                                Text("Filter Status: ${orderStatusFilter.replaceFirstChar { it.uppercase() }}")
                            }
                            DropdownMenu(expanded = statusFilterExpanded, onDismissRequest = { statusFilterExpanded = false }) {
                                listOf("All", "rfq", "quote_sent", "assigned", "signed_off", "completed", "cancelled").forEach { s ->
                                    DropdownMenuItem(
                                        text = { Text(s.replaceFirstChar { it.uppercase() }) },
                                        onClick = {
                                            orderStatusFilter = s
                                            statusFilterExpanded = false
                                        }
                                    )
                                }
                            }
                        }

                        val filteredOrders = jobs.filter { job ->
                            val matchesSearch = orderSearchQuery.isBlank() || 
                                job.optText("contactName").contains(orderSearchQuery, ignoreCase = true)
                            val matchesStatus = orderStatusFilter == "All" || job.optText("status").equals(orderStatusFilter, ignoreCase = true)
                            matchesSearch && matchesStatus
                        }

                        if (filteredOrders.isEmpty()) {
                            Text("No jobs match the filter criteria.", modifier = Modifier.padding(vertical = 16.dp))
                        }

                        filteredOrders.forEach { job ->
                            val jId = job.mongoId()
                            
                            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = "${job.optText("contactName")} - ${job.optText("address")}", 
                                        style = MaterialTheme.typography.titleMedium
                                    )
                                    
                                    Text(
                                        text = "Service: ${job.optText("pestDescription")}", 
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    
                                    var statusExpanded by remember { mutableStateOf(false) }
                                    Box {
                                        Text(
                                            text = "Status: ${job.optText("status").ifBlank { "unknown" }}", 
                                            modifier = Modifier.clickable { statusExpanded = true }, 
                                            color = MaterialTheme.colorScheme.primary,
                                            style = MaterialTheme.typography.bodyMedium
                                        )
                                        DropdownMenu(expanded = statusExpanded, onDismissRequest = { statusExpanded = false }) {
                                            listOf("rfq", "quote_sent", "assigned", "signed_off", "completed", "cancelled").forEach { s ->
                                                DropdownMenuItem(text = { Text(s) }, onClick = { 
                                                    statusExpanded = false
                                                    scope.launch {
                                                        sdk.patchAdminJob(jId, AdminJobPatchBody(status = s))
                                                            .onSuccess { reload() }
                                                            .onFailure { err -> handleSdkFailure(err, snack, onAuthFailure, "Failed") }
                                                    }
                                                })
                                            }
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    
                                    var techExpanded by remember { mutableStateOf(false) }
                                    val currentTechId = job.nested("technician")?.optText("_id") ?: job.optText("technicianId")
                                    val currentTechName = users.find { it.id == currentTechId || it.auth0Id == currentTechId }?.name ?: "Unassigned"
                                    
                                    Box {
                                        Text(
                                            text = "Assigned: $currentTechName", 
                                            modifier = Modifier.clickable { techExpanded = true }, 
                                            color = MaterialTheme.colorScheme.primary,
                                            style = MaterialTheme.typography.bodyMedium
                                        )
                                        DropdownMenu(expanded = techExpanded, onDismissRequest = { techExpanded = false }) {
                                            DropdownMenuItem(text = { Text("Unassigned") }, onClick = {
                                                techExpanded = false
                                                scope.launch { 
                                                    sdk.patchAdminJob(jId, AdminJobPatchBody(technicianId = null))
                                                        .onSuccess { reload() }
                                                }
                                            })
                                            users.filter { it.role == "technician" }.forEach { tech ->
                                                DropdownMenuItem(text = { Text(tech.name ?: tech.email ?: "Unknown") }, onClick = {
                                                    techExpanded = false
                                                    scope.launch { 
                                                        val uid = tech.id ?: tech.auth0Id
                                                        sdk.patchAdminJob(jId, AdminJobPatchBody(technicianId = uid))
                                                            .onSuccess { reload() }
                                                    }
                                                })
                                            }
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    
                                    var showPriceDialog by remember { mutableStateOf(false) }
                                    var tempPrice by remember { mutableStateOf(job.optText("quotedPrice")) }
                                    Text(
                                        text = "Price: $${job.optText("quotedPrice").ifBlank { "0.00" }}",
                                        modifier = Modifier.clickable { 
                                            tempPrice = job.optText("quotedPrice")
                                            showPriceDialog = true 
                                        }, 
                                        color = MaterialTheme.colorScheme.primary,
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                    
                                    if (showPriceDialog) {
                                        AlertDialog(
                                            onDismissRequest = { showPriceDialog = false },
                                            title = { Text("Set Price") },
                                            text = {
                                                OutlinedTextField(
                                                    value = tempPrice, 
                                                    onValueChange = { tempPrice = it }, 
                                                    label = { Text("Price (e.g. 150.00)") },
                                                    singleLine = true
                                                )
                                            },
                                            confirmButton = {
                                                Button(onClick = {
                                                    showPriceDialog = false
                                                    scope.launch {
                                                        sdk.patchAdminJob(jId, AdminJobPatchBody(quotedPrice = tempPrice.toDoubleOrNull()))
                                                            .onSuccess { reload() }
                                                            .onFailure { err -> handleSdkFailure(err, snack, onAuthFailure, "Failed") }
                                                    }
                                                }) { Text("Save") }
                                            },
                                            dismissButton = {
                                                TextButton(onClick = { showPriceDialog = false }) { Text("Cancel") }
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }
                    "Settings" -> {
                        Text("Mail integrations", style = MaterialTheme.typography.titleLarge)
                        Spacer(modifier = Modifier.height(16.dp))

                        Card(modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("Microsoft 365 / Exchange", style = MaterialTheme.typography.titleMedium)
                                Spacer(modifier = Modifier.height(8.dp))
                                OutlinedTextField(
                                    value = msTenantId, onValueChange = { msTenantId = it },
                                    label = { Text("Tenant ID") }, modifier = Modifier.fillMaxWidth()
                                )
                                OutlinedTextField(
                                    value = msClientId, onValueChange = { msClientId = it },
                                    label = { Text("Client ID") }, modifier = Modifier.fillMaxWidth()
                                )
                                OutlinedTextField(
                                    value = msClientSecret, onValueChange = { msClientSecret = it },
                                    label = { Text("Client Secret") }, modifier = Modifier.fillMaxWidth()
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Button(onClick = {
                                    scope.launch { snack.showSnackbar("Microsoft config saved (Simulated)") }
                                }, modifier = Modifier.fillMaxWidth()) {
                                    Text("Save App Registration Details")
                                }
                                if (microsoftConnectUrl.isNotBlank()) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    OutlinedButton(
                                        onClick = { ctx.startActivity(Intent(Intent.ACTION_VIEW, microsoftConnectUrl.toUri())) },
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text("Re-authorize or Change Account")
                                    }
                                }
                            }
                        }

                        Card(modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("Google Workspace / Gmail", style = MaterialTheme.typography.titleMedium)
                                Spacer(modifier = Modifier.height(8.dp))
                                OutlinedTextField(
                                    value = googleClientId, onValueChange = { googleClientId = it },
                                    label = { Text("Client ID") }, modifier = Modifier.fillMaxWidth()
                                )
                                OutlinedTextField(
                                    value = googleClientSecret, onValueChange = { googleClientSecret = it },
                                    label = { Text("Client Secret") }, modifier = Modifier.fillMaxWidth()
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Button(onClick = {
                                    scope.launch { snack.showSnackbar("Google config saved (Simulated)") }
                                }, modifier = Modifier.fillMaxWidth()) {
                                    Text("Save Cloud Console Details")
                                }
                                Spacer(modifier = Modifier.height(16.dp))
                                Text("Test Configuration", style = MaterialTheme.typography.titleSmall)
                                OutlinedTextField(
                                    value = testEmailAddress, onValueChange = { testEmailAddress = it },
                                    label = { Text("Test Email Address") }, modifier = Modifier.fillMaxWidth()
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                OutlinedButton(onClick = {
                                    scope.launch { snack.showSnackbar("Test email sent to $testEmailAddress (Simulated)") }
                                }, modifier = Modifier.fillMaxWidth()) {
                                    Text("Send Test Email")
                                }
                                if (googleConnectUrl.isNotBlank()) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    OutlinedButton(
                                        onClick = { ctx.startActivity(Intent(Intent.ACTION_VIEW, googleConnectUrl.toUri())) },
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text("Re-authorize or Change Account")
                                    }
                                }
                            }
                        }
                        
                        if (integrationPretty.isNotBlank()) {
                            Spacer(modifier = Modifier.height(16.dp))
                            Text("Raw Integration JSON", style = MaterialTheme.typography.titleSmall)
                            Text(integrationPretty, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }

        NavigationBar {
            NavigationBarItem(
                icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                label = { Text("Dashboard") },
                selected = selectedTab == "Dashboard",
                onClick = { selectedTab = "Dashboard" }
            )
            NavigationBarItem(
                icon = { Icon(Icons.Default.People, contentDescription = "Users") },
                label = { Text("Users") },
                selected = selectedTab == "Users",
                onClick = { selectedTab = "Users" }
            )
            NavigationBarItem(
                icon = { Icon(Icons.AutoMirrored.Filled.List, contentDescription = "Orders") },
                label = { Text("Orders") },
                selected = selectedTab == "Orders",
                onClick = { selectedTab = "Orders" }
            )
            NavigationBarItem(
                icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                label = { Text("Settings") },
                selected = selectedTab == "Settings",
                onClick = { selectedTab = "Settings" }
            )
        }
    }
}
