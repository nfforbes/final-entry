package com.finalentry.mobile.android.ui

import android.util.Log
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.finalentry.mobile.FinalEntrySdk
import com.finalentry.mobile.model.CreateCustomerJobRequest
import com.finalentry.mobile.model.MeResponseDto
import com.finalentry.mobile.model.ServiceLiteDto
import kotlinx.coroutines.launch

@Composable
fun CustomerPortal(
    sdk: FinalEntrySdk,
    me: MeResponseDto,
    snack: SnackbarHostState,
    onAuthFailure: () -> Unit,
) {
    var tab by remember { mutableIntStateOf(0) }
    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = tab == 0,
                    onClick = { tab = 0 },
                    icon = { Icon(Icons.Default.ShoppingCart, null) },
                    label = { Text("Book") },
                )
                NavigationBarItem(
                    selected = tab == 1,
                    onClick = { tab = 1 },
                    icon = { Icon(Icons.Default.Timeline, null) },
                    label = { Text("Orders") },
                )
                NavigationBarItem(
                    selected = tab == 2,
                    onClick = { tab = 2 },
                    icon = { Icon(Icons.Default.Person, null) },
                    label = { Text("Me") },
                )
                if ("admin" in me.roleSet()) {
                    NavigationBarItem(
                        selected = tab == 3,
                        onClick = { tab = 3 },
                        icon = { Icon(Icons.Default.AdminPanelSettings, null) },
                        label = { Text("Admin") },
                    )
                }
            }
        },
    ) { inset ->
        Column(Modifier.padding(inset).padding(12.dp).fillMaxSize()) {
            when (tab) {
                0 -> CustomerBookingScreen(sdk, me, snack, onAuthFailure)
                1 -> CustomerOrdersScreen(sdk, snack, onAuthFailure)
                2 -> CustomerProfile(me, onAuthFailure)
                3 -> AdminPortal(sdk, snack, onAuthFailure)
                else -> CustomerProfile(me, onAuthFailure)
            }
        }
    }
}

private val JamaicanParishes =
    listOf(
        "Kingston",
        "Saint Andrew",
        "Saint Thomas",
        "Portland",
        "Saint Mary",
        "Saint Ann",
        "Trelawny",
        "Saint James",
        "Hanover",
        "Westmoreland",
        "Saint Elizabeth",
        "Manchester",
        "Clarendon",
        "Saint Catherine",
    )

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DropdownField(
    label: String,
    value: String,
    options: List<String>,
    onSelect: (String) -> Unit,
    enabled: Boolean = true,
    placeholder: String = "",
) {
    var open by remember { mutableStateOf(false) }
    val canOpen = enabled && options.isNotEmpty()
    Box(Modifier.fillMaxWidth().padding(top = 8.dp)) {
        OutlinedTextField(
            value = value,
            onValueChange = {},
            readOnly = true,
            enabled = enabled,
            label = { Text(label) },
            placeholder = { if (placeholder.isNotBlank()) Text(placeholder) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = open) },
            colors = ExposedDropdownMenuDefaults.outlinedTextFieldColors(),
            modifier = Modifier.fillMaxWidth(),
        )
        Box(
            Modifier
                .matchParentSize()
                .clickable(enabled = canOpen) { open = true },
        )
    }
    if (open) {
        AlertDialog(
            onDismissRequest = { open = false },
            title = { Text(label) },
            text = {
                Column(Modifier.heightIn(max = 420.dp).verticalScroll(rememberScrollState())) {
                    options.forEach { option ->
                        Text(
                            option,
                            modifier =
                                Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        onSelect(option)
                                        open = false
                                    }
                                    .padding(vertical = 12.dp),
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { open = false }) { Text("Close") }
            },
        )
    }
}

@Composable
private fun CustomerBookingScreen(
    sdk: FinalEntrySdk,
    me: MeResponseDto,
    snack: SnackbarHostState,
    onAuthFailure: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var services by remember { mutableStateOf<List<ServiceLiteDto>>(emptyList()) }
    var selected by remember { mutableStateOf<ServiceLiteDto?>(null) }
    var parish by remember {
        mutableStateOf(me.profile?.parish?.takeIf { it in JamaicanParishes } ?: "Saint Andrew")
    }
    var address by remember { mutableStateOf("") }
    var pest by remember { mutableStateOf("") }
    var urgency by remember { mutableStateOf("medium") }
    var phone by remember { mutableStateOf(me.profile?.phone.orEmpty()) }
    var banner by remember { mutableStateOf<String?>(null) }
    var bannerIsError by remember { mutableStateOf(true) }
    var sending by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        sdk.fetchServices()
            .onFailure { handleSdkFailureOrBanner(it, onAuthFailure) { banner = it } }
            .onSuccess { services = it.services }
    }

    Column(
        Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState()),
    ) {
        DropdownField(
            label = "Catalog service",
            value = selected?.title ?: selected?.slug.orEmpty(),
            options = services.map { it.title ?: it.slug.orEmpty() }.filter { it.isNotBlank() },
            enabled = services.isNotEmpty(),
            placeholder = if (services.isEmpty()) "Loading catalog…" else "Select a service",
            onSelect = { label ->
                selected = services.firstOrNull { (it.title ?: it.slug.orEmpty()) == label }
                banner = null
            },
        )
        DropdownField(
            label = "Parish",
            value = parish,
            options = JamaicanParishes,
            onSelect = { parish = it },
        )
        OutlinedTextField(address, { address = it }, Modifier.fillMaxWidth(), label = { Text("Address") })
        OutlinedTextField(pest, { pest = it }, Modifier.fillMaxWidth(), label = { Text("Pest / concern") }, maxLines = 5)
        OutlinedTextField(phone, { phone = it }, Modifier.fillMaxWidth(), label = { Text("Phone") })

        Text("Urgency", Modifier.padding(top = 8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf("low", "medium", "high", "emergency").forEach { u ->
                FilterChip(
                    selected = urgency == u,
                    onClick = { urgency = u },
                    label = { Text(u) },
                )
            }
        }

        Button(
            enabled = !sending,
            modifier =
                Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp),
            onClick = {
                val missing = buildList {
                    if (selected == null) add("a service")
                    if (address.isBlank()) add("an address")
                    if (pest.isBlank()) add("the pest concern")
                    if (phone.isBlank()) add("a phone number")
                }
                if (missing.isNotEmpty()) {
                    bannerIsError = true
                    banner = "Add ${missing.joinToString(", ")} before sending."
                    return@Button
                }
                val svcSlug = selected?.slug?.takeIf { it.isNotBlank() }
                    ?: selected?._id?.takeIf { it.isNotBlank() }
                if (svcSlug == null) {
                    bannerIsError = true
                    banner = "Select a catalog service."
                    return@Button
                }
                val mail = me.profile?.email.orEmpty().ifBlank { null }
                if (mail == null) {
                    bannerIsError = true
                    banner = "Your account has no email, so this request cannot be sent."
                    return@Button
                }

                scope.launch {
                    sending = true
                    sdk
                        .createCustomerJob(
                            CreateCustomerJobRequest(
                                serviceId = svcSlug,
                                parish = parish,
                                address = address.trim(),
                                pestDescription = pest.trim(),
                                urgency = urgency,
                                contactName = me.profile?.name?.takeIf { it.isNotBlank() } ?: "Customer",
                                contactEmail = mail,
                                contactPhone = phone.trim(),
                            ),
                        )
                        .onSuccess {
                            bannerIsError = false
                            banner = "Request sent. A technician will contact you to confirm."
                            address = ""
                            pest = ""
                            selected = null
                            snack.showSnackbar("Request sent")

                        }



                        .onFailure {
                            Log.e("FinalEntry", "booking failed", it)
                            bannerIsError = true
                            handleSdkFailureOrBanner(it, onAuthFailure) { banner = it }
                        }
                    sending = false



                }



            },

        ) {

            Text(if (sending) "Sending…" else "Submit")


        }



        if (banner == null && (selected == null || address.isBlank() || pest.isBlank() || phone.isBlank())) {
            Text(
                "Choose a service, then add an address, the pest concern, and a phone number.",
                Modifier.padding(top = 8.dp),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        banner?.let {

            Text(
                it,
                Modifier.padding(top = 8.dp),
                color = if (bannerIsError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
            )

        }



    }



}


@Composable
private fun CustomerProfile(me: MeResponseDto, onAuthFailure: () -> Unit) {
    Column(Modifier.verticalScroll(rememberScrollState())) {
        Text(me.profile?.name ?: "Profile")
        me.profile?.email?.let { Text(it) }

        Button(onClick = onAuthFailure, modifier = Modifier.padding(top = 12.dp)) {
            Text("Logout")
        }
    }
}
