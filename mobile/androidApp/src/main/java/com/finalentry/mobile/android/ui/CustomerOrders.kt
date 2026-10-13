package com.finalentry.mobile.android.ui

import android.content.Context
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.finalentry.mobile.FinalEntrySdk
import com.finalentry.mobile.android.BuildConfig
import com.finalentry.mobile.model.TrackingPatchDto
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.BoundingBox
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.CustomZoomButtonsController
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import java.io.File

private const val TRACKING_POLL_MS = 15_000L

@Composable
internal fun CustomerOrdersScreen(
    sdk: FinalEntrySdk,
    snack: SnackbarHostState,
    onAuthFailure: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var items by remember { mutableStateOf<List<JsonObject>>(emptyList()) }
    var loaded by remember { mutableStateOf(false) }
    var selectedId by remember { mutableStateOf<String?>(null) }
    var tracking by remember { mutableStateOf(false) }

    suspend fun reload() {
        sdk.fetchCustomerJobs()
            .onSuccess {
                items = it.jobs.mapNotNull { el -> el as? JsonObject }
            }
            .onFailure {
                snack.handleSdkFailureSuspending(it, onAuthFailure, "Failed to load orders")
            }
        loaded = true
    }

    LaunchedEffect(Unit) { reload() }

    val selected = selectedId?.let { id -> items.firstOrNull { it.mongoId() == id } }

    when {
        selected != null && tracking -> {
            BackHandler { tracking = false }
            LiveTrackingScreen(sdk = sdk, job = selected, onBack = { tracking = false })
        }
        selected != null -> {
            BackHandler { selectedId = null }
            OrderDetailScreen(
                sdk = sdk,
                job = selected,
                snack = snack,
                onAuthFailure = onAuthFailure,
                onBack = { selectedId = null },
                onTrack = { tracking = true },
                onSignedOff = { scope.launch { reload() } },
            )
        }
        else -> OrdersList(items, loaded) { job ->
            selectedId = job.mongoId()
            tracking = false
        }
    }
}

@Composable
private fun OrdersList(
    items: List<JsonObject>,
    loaded: Boolean,
    onOpen: (JsonObject) -> Unit,
) {
    if (loaded && items.isEmpty()) {
        Text("No orders yet. Book a service to get started.", Modifier.padding(8.dp))
        return
    }
    LazyColumn(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        items(items, key = { it.mongoId() }) { job ->
            ListItem(
                headlineContent = { Text(job.serviceTitle()) },
                supportingContent = {
                    Text(job.statusLabel() + " · " + job.optText("address"))
                },
                trailingContent = {
                    if (job.optText("trackingToken").isNotBlank()) {
                        Icon(Icons.Default.LocationOn, contentDescription = "Trackable")
                    }
                },
                modifier = Modifier.clickable { onOpen(job) },
            )
            HorizontalDivider()
        }
    }
}

@Composable
private fun OrderDetailScreen(
    sdk: FinalEntrySdk,
    job: JsonObject,
    snack: SnackbarHostState,
    onAuthFailure: () -> Unit,
    onBack: () -> Unit,
    onTrack: () -> Unit,
    onSignedOff: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val token = job.optText("trackingToken")
    val status = job.optText("status")
    var name by remember { mutableStateOf("") }
    var signature by remember { mutableStateOf("") }

    Column(
        Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState()),
    ) {
        BackRow("Orders", onBack)

        Text(job.serviceTitle(), style = MaterialTheme.typography.titleLarge)
        DetailLine("Status", job.statusLabel())
        DetailLine("Address", job.optText("address"))
        DetailLine("Parish", job.optText("parish"))
        DetailLine("Scheduled", job.optText("scheduledDate").take(10))
        DetailLine("Technician", job.nestedText("technicianId", "name"))
        DetailLine("Technician notes", job.optText("technicianNotes"))

        if (token.isNotBlank()) {
            Button(
                onClick = onTrack,
                modifier =
                    Modifier
                        .fillMaxWidth()
                        .padding(top = 16.dp),
            ) {
                Icon(Icons.Default.LocationOn, contentDescription = null)
                Text("Track technician live", Modifier.padding(start = 8.dp))
            }
        }

        if (token.isNotBlank() && status.equals("completed", ignoreCase = true)) {
            HorizontalDivider(Modifier.padding(vertical = 16.dp))
            Text("Sign off this job", style = MaterialTheme.typography.titleMedium)
            OutlinedTextField(
                name,
                { name = it },
                Modifier.fillMaxWidth(),
                label = { Text("Printed name") },
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
                            token,
                            TrackingPatchDto(
                                signedOffBy = name.takeIf { it.isNotBlank() },
                                signatureImage = signature,
                            ),
                        )
                            .onSuccess {
                                snack.showSnackbar("Signed off")
                                onSignedOff()
                            }
                            .onFailure {
                                snack.handleSdkFailureSuspending(it, onAuthFailure, "Sign-off failed")
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

@Composable
private fun LiveTrackingScreen(
    sdk: FinalEntrySdk,
    job: JsonObject,
    onBack: () -> Unit,
) {
    val token = job.optText("trackingToken")
    val destination = (job["location"] as? JsonObject)?.toGeoPoint()
    var technician by remember { mutableStateOf<GeoPoint?>(null) }
    var technicianName by remember { mutableStateOf(job.nestedText("technicianId", "name")) }
    var sharing by remember { mutableStateOf<Boolean?>(null) }
    var status by remember { mutableStateOf(job.optText("status")) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(token) {
        while (isActive) {
            sdk.trackingSnapshot(token)
                .onSuccess { root ->
                    val snapshot = root["job"] as? JsonObject
                    val tech = snapshot?.get("technician") as? JsonObject
                    status = snapshot?.optText("status").orEmpty().ifBlank { status }
                    tech?.optText("name")?.takeIf { it.isNotBlank() }?.let { technicianName = it }
                    sharing = (tech?.get("isSharing") as? JsonPrimitive)?.booleanOrNull == true
                    technician = (tech?.get("location") as? JsonObject)?.toGeoPoint()
                    error = null
                }
                .onFailure { error = it.message ?: "Could not load tracking" }
            delay(TRACKING_POLL_MS)
        }
    }

    Column(Modifier.fillMaxSize()) {
        BackRow("Order", onBack)
        Text(
            technicianName.ifBlank { "Your technician" },
            style = MaterialTheme.typography.titleLarge,
        )
        Text(statusLabel(status), color = MaterialTheme.colorScheme.onSurfaceVariant)
        error?.let { Text(it, color = MaterialTheme.colorScheme.error) }

        val showMap = technician != null || destination != null
        val message =
            when {
                sharing == null -> "Loading technician location…"
                sharing == false -> "Technician has not started journey yet"
                technician == null -> "Waiting for technician location…"
                else -> null
            }

        Box(
            Modifier
                .fillMaxWidth()
                .weight(1f)
                .padding(top = 12.dp),
        ) {
            if (showMap) {
                TrackingMap(
                    technician = technician,
                    destination = destination,
                    modifier = Modifier.fillMaxSize(),
                )
            }
            message?.let {
                Surface(
                    tonalElevation = 4.dp,
                    shape = MaterialTheme.shapes.large,
                    modifier =
                        Modifier
                            .align(if (showMap) Alignment.TopCenter else Alignment.Center)
                            .padding(12.dp),
                ) {
                    Text(it, Modifier.padding(horizontal = 16.dp, vertical = 10.dp))
                }
            }
        }
    }
}

@Composable
private fun TrackingMap(
    technician: GeoPoint?,
    destination: GeoPoint?,
    modifier: Modifier = Modifier,
) {
    val ctx = LocalContext.current
    val technicianTint = MaterialTheme.colorScheme.primary.toArgb()
    val mapView = remember { createMapView(ctx) }
    val technicianMarker =
        remember {
            Marker(mapView).apply {
                title = "Technician"
                setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                icon = icon?.mutate()?.apply { setTint(technicianTint) }
            }
        }
    val destinationMarker =
        remember {
            Marker(mapView).apply {
                title = "Service address"
                setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
            }
        }
    val framing = remember { FramingState() }

    DisposableEffect(mapView) {
        mapView.onResume()
        onDispose {
            mapView.onPause()
            mapView.onDetach()
        }
    }

    AndroidView(factory = { mapView }, modifier = modifier) { view ->
        view.overlays.remove(destinationMarker)
        view.overlays.remove(technicianMarker)
        destination?.let {
            destinationMarker.position = it
            view.overlays.add(destinationMarker)
        }
        technician?.let {
            technicianMarker.position = it
            view.overlays.add(technicianMarker)
        }

        val needsFrame = !framing.framed || (technician != null && !framing.framedTechnician)
        if (needsFrame) {
            framing.framed = true
            framing.framedTechnician = technician != null
            view.post { frame(view, listOfNotNull(technician, destination)) }
        }
        view.invalidate()
    }
}

private class FramingState {
    var framed = false
    var framedTechnician = false
}

private fun createMapView(ctx: Context): MapView {
    Configuration.getInstance().apply {
        load(ctx, ctx.getSharedPreferences("osmdroid", Context.MODE_PRIVATE))
        userAgentValue = BuildConfig.APPLICATION_ID
        osmdroidBasePath = File(ctx.cacheDir, "osmdroid")
        osmdroidTileCache = File(osmdroidBasePath, "tiles")
    }
    return MapView(ctx).apply {
        setTileSource(TileSourceFactory.MAPNIK)
        setMultiTouchControls(true)
        zoomController.setVisibility(CustomZoomButtonsController.Visibility.NEVER)
        controller.setZoom(15.0)
    }
}

private fun frame(view: MapView, points: List<GeoPoint>) {
    when (points.size) {
        0 -> Unit
        1 -> {
            view.controller.setZoom(16.0)
            view.controller.setCenter(points.first())
        }
        else -> {
            val box = BoundingBox.fromGeoPointsSafe(points).increaseByScale(1.5f)
            view.zoomToBoundingBox(box, false)
        }
    }
}

@Composable
private fun BackRow(label: String, onBack: () -> Unit) {
    TextButton(onClick = onBack) {
        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null)
        Text(label, Modifier.padding(start = 4.dp))
    }
}

@Composable
private fun DetailLine(label: String, value: String) {
    if (value.isBlank()) return
    Column(Modifier.padding(top = 8.dp)) {
        Text(label, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold)
        Text(value)
    }
}

private fun JsonObject.nestedText(objectKey: String, field: String): String =
    (this[objectKey] as? JsonObject)?.optText(field).orEmpty()

private fun JsonObject.serviceTitle(): String =
    nestedText("serviceId", "title").ifBlank { nestedText("serviceId", "slug") }.ifBlank { "Service request" }

private fun JsonObject.statusLabel(): String = statusLabel(optText("status"))

private fun statusLabel(status: String): String =
    status.replace('_', ' ').replaceFirstChar { it.uppercase() }.ifBlank { "Unknown" }

private fun JsonObject.toGeoPoint(): GeoPoint? {
    val lat = this["lat"].asDouble() ?: return null
    val lng = this["lng"].asDouble() ?: return null
    return GeoPoint(lat, lng)
}

private fun JsonElement?.asDouble(): Double? = (this as? JsonPrimitive)?.doubleOrNull
