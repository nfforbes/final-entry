package com.finalentry.mobile.android.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material.icons.filled.TravelExplore
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
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
import com.finalentry.mobile.model.TrackingPatchDto
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonObject

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
                    icon = { Icon(Icons.Default.TravelExplore, null) },
                    label = { Text("Track") },
                )
                NavigationBarItem(
                    selected = tab == 3,
                    onClick = { tab = 3 },
                    icon = { Icon(Icons.Default.Person, null) },
                    label = { Text("Me") },
                )
                val role = (me.role ?: me.profile?.role)?.lowercase()
                if (role == "admin") {
                    NavigationBarItem(
                        selected = tab == 4,
                        onClick = { tab = 4 },
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
                2 -> CustomerTrackingScreen(sdk, snack, onAuthFailure)
                3 -> CustomerProfile(me, onAuthFailure)
                4 -> AdminPortal(sdk, snack, onAuthFailure)
                else -> CustomerProfile(me, onAuthFailure)
            }
        }
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
    var parish by remember { mutableStateOf("Saint Andrew") }
    var address by remember { mutableStateOf("") }
    var pest by remember { mutableStateOf("") }
    var urgency by remember { mutableStateOf("medium") }
    var phone by remember { mutableStateOf(me.profile?.phone.orEmpty()) }
    var banner by remember { mutableStateOf<String?>(null) }

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
        Text("Pick a catalog service", style = MaterialTheme.typography.titleMedium)
        services.forEach { svc ->
            ListItem(
                headlineContent = { Text(svc.title ?: svc.slug.orEmpty()) },
                supportingContent = { svc.slug?.let { slug -> Text("slug: $slug") } },
                modifier =
                    Modifier.clickable {
                        selected = svc
                        banner = null
                    },
            )
            HorizontalDivider()
        }

        OutlinedTextField(parish, { parish = it }, Modifier.fillMaxWidth(), label = { Text("Parish") })
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
            enabled = selected != null && address.isNotBlank() && pest.isNotBlank() && phone.isNotBlank(),
            modifier =
                Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp),
            onClick = {
                val svcSlug = selected?.slug ?: selected?._id?.takeIf { it.isNotBlank() }
                if (svcSlug == null) {
                    banner = "Select a service from the catalog list."
                    return@Button
                }
                val mail = me.profile?.email.orEmpty().ifBlank { null }
                if (mail == null) {
                    banner =
                        "Use token with openid profile email so /api/mobile/me includes your email."
                    return@Button
                }

                scope.launch {
                    sdk
                        .createCustomerJob(
                            CreateCustomerJobRequest(
                                serviceId = svcSlug,
                                parish = parish,
                                address = address,
                                pestDescription = pest,
                                urgency = urgency,
                                contactName = me.profile?.name ?: "Customer",
                                contactEmail = mail,
                                contactPhone = phone,
                            ),
                        )
                        .onSuccess {
                            banner = "Created RFQ " + (it.status ?: "") + " id=" + it.id
                            snack.showSnackbar("RFQ created")

                        }



                        .onFailure {
                            handleSdkFailureOrBanner(it, onAuthFailure) { banner = it }
                        }



                }



            },

        ) {

            Text("Submit")


        }



        banner?.let {

            Text(it, Modifier.padding(top = 8.dp), color = MaterialTheme.colorScheme.error)

        }



    }



}


@Composable
private fun CustomerOrdersScreen(
    sdk: FinalEntrySdk,
    snack: SnackbarHostState,
    onAuthFailure: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var items by remember { mutableStateOf<List<JsonObject>>(emptyList()) }

    LaunchedEffect(Unit) {
        sdk.fetchCustomerJobs()
            .onSuccess {
                items =
                    it.jobs.mapNotNull { el ->
                        kotlin.runCatching { el as JsonObject }.getOrNull()
                    }
            }
            .onFailure {
                handleSdkFailure(it, snack, onAuthFailure, "Failed to load orders")
            }
    }

    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        itemsIndexed(items) { _, jo ->
            Column {
                Text(jo.mongoId() + " · " + jo.optText("status"))
                Text(jo.optText("address"))
            }
            HorizontalDivider()
        }
    }
}

@Composable
private fun CustomerTrackingScreen(
    sdk: FinalEntrySdk,
    snack: SnackbarHostState,
    onAuthFailure: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var token by remember { mutableStateOf("") }
    var job by remember { mutableStateOf<JsonObject?>(null) }
    var name by remember { mutableStateOf("") }
    var signature by remember { mutableStateOf("") }

    Column(Modifier.verticalScroll(rememberScrollState())) {
        OutlinedTextField(
            token,
            { token = it },
            Modifier.fillMaxWidth(),
            label = { Text("Tracking token") },
        )

        Button(
            onClick = {
                scope.launch {
                    sdk.trackingSnapshot(token)
                        .onSuccess { root ->
                            job =
                                kotlin.runCatching {
                                    root["job"]!!.let { e -> e as JsonObject }
                                }.getOrNull()
                        }
                        .onFailure {
                            handleSdkFailure(it, snack, onAuthFailure, "Tracking failed")
                        }
                }
            },

            modifier = Modifier.padding(top = 8.dp),
            enabled = token.isNotBlank(),
        ) {
            Text("Refresh")
        }

        job?.let { jobj ->
            HorizontalDivider(Modifier.padding(vertical = 8.dp))
            Text(jobj.toString())

            val stat = jobj.optText("status")
            if (stat.equals("completed", ignoreCase = true)) {
                OutlinedTextField(
                    name,
                    { name = it },
                    Modifier.fillMaxWidth(),
                    label = {
                        Text("Printed name")
                    },
                )

                OutlinedTextField(
                    signature,
                    { signature = it },
                    Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    label = { Text("Signature PNG base64") },
                )

                Button(
                    onClick = {
                        scope.launch {
                            sdk.submitTrackingSignature(
                                token.trim(),
                                TrackingPatchDto(
                                    signedOffBy = name.takeIf { it.isNotBlank() },
                                    signatureImage = signature,
                                ),
                            )
                                .onSuccess {
                                    snack.showSnackbar("Signed off")
                                }
                                .onFailure {
                                    handleSdkFailure(it, snack, onAuthFailure, "Sign-off failed")
                                }
                        }

                    },

                    modifier = Modifier.padding(top = 8.dp),
                    enabled = signature.isNotBlank(),
                ) {
                    Text("Sign-off")
                }
            }
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
