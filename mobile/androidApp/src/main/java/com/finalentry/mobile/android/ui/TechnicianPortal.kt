package com.finalentry.mobile.android.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.finalentry.mobile.FinalEntrySdk
import com.finalentry.mobile.model.TechnicianJobPatchDto
import com.google.android.gms.location.LocationServices
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

@Composable
fun TechnicianPortal(sdk: FinalEntrySdk, snack: SnackbarHostState) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    var jobs by remember { mutableStateOf<List<JsonObject>>(emptyList()) }
    var expandedJobId by remember { mutableStateOf<String?>(null) }

    fun fetchJobs() {
        scope.launch {
            sdk.fetchTechnicianJobs()
                .onSuccess { env ->
                    jobs =
                        env.jobs.mapNotNull { element ->
                            runCatching { element as JsonObject }.getOrNull()
                        }
                }
                .onFailure { err -> snack.showSnackbar(err.message ?: "Jobs failed") }
        }
    }

    val locationPermissionLauncher =
        rememberLauncherForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions(),
        ) { perms ->
            val granted = perms[Manifest.permission.ACCESS_FINE_LOCATION] == true || 
                          perms[Manifest.permission.ACCESS_COARSE_LOCATION] == true
            if (granted) {
                try {
                    val client = LocationServices.getFusedLocationProviderClient(ctx)
                    client.lastLocation.addOnSuccessListener { location ->
                        if (location != null) {
                            scope.launch {
                                sdk.postTechnicianLocation(location.latitude, location.longitude, true)
                            }
                        }
                    }
                } catch (e: Exception) {
                    // Ignore missing play services
                }
            } else {
                scope.launch { snack.showSnackbar("Location permission denied. Features limited.") }
            }
        }

    LaunchedEffect(Unit) {
        val hasFine = ContextCompat.checkSelfPermission(ctx, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val hasCoarse = ContextCompat.checkSelfPermission(ctx, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        if (!hasFine && !hasCoarse) {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION,
                )
            )
        } else {
            try {
                val client = LocationServices.getFusedLocationProviderClient(ctx)
                client.lastLocation.addOnSuccessListener { location ->
                    if (location != null) {
                        scope.launch {
                            sdk.postTechnicianLocation(location.latitude, location.longitude, true)
                        }
                    }
                }
            } catch (e: Exception) {}
        }
        
        fetchJobs()
    }

    fun openInMaps(address: String) {
        if (address.isNotEmpty()) {
            try {
                ctx.startActivity(
                    Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=${Uri.encode(address)}")),
                )
            } catch (e: Exception) {
                scope.launch { snack.showSnackbar("No maps app installed") }
            }
        }
    }

    fun bump(id: String, status: String, address: String = "") {
        scope.launch {
            if (id.isEmpty()) return@launch
            sdk.patchTechnicianJob(id, TechnicianJobPatchDto(status = status))
                .onSuccess { 
                    fetchJobs()
                    if (status == "on_route" && address.isNotEmpty()) {
                        val res = snack.showSnackbar("Status updated to On Route", actionLabel = "Navigate")
                        if (res == SnackbarResult.ActionPerformed) {
                            openInMaps(address)
                        }
                    } else {
                        snack.showSnackbar("Saved")
                    }
                }
                .onFailure { err -> snack.showSnackbar(err.message ?: "Patch failed") }
        }
    }

    Column(
        modifier =
            Modifier
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
    ) {
        Text("Your Assignments", style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(16.dp))

        if (jobs.isEmpty()) {
            Text("No assignments right now.", style = MaterialTheme.typography.bodyLarge)
        }

        jobs.forEach { job ->
            val jobId = job.mongoId()
            val status = job.optText("status")
            val address = job.optText("address").trim()
            val serviceTitle = job["serviceId"]?.jsonObject?.get("title")?.jsonPrimitive?.content ?: "Service"
            val pestDescription = job.optText("pestDescription")
            val isExpanded = expandedJobId == jobId

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
                    .clickable { 
                        expandedJobId = if (isExpanded) null else jobId 
                    },
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Job ID: $jobId", style = MaterialTheme.typography.labelSmall)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Status: ${status.replace("_", " ").uppercase()}", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(address, style = MaterialTheme.typography.bodyLarge)
                    
                    if (isExpanded) {
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Service Protocol", style = MaterialTheme.typography.titleSmall)
                        Text(serviceTitle, style = MaterialTheme.typography.bodyMedium)
                        if (pestDescription.isNotBlank()) {
                            Text(pestDescription, style = MaterialTheme.typography.bodySmall)
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                        
                        var notesInput by remember(jobId) { mutableStateOf(job.optText("technicianNotes")) }
                        
                        OutlinedTextField(
                            value = notesInput,
                            onValueChange = { notesInput = it },
                            label = { Text("Field Findings") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 3
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = {
                                scope.launch {
                                    sdk.patchTechnicianJob(jobId, TechnicianJobPatchDto(technicianNotes = notesInput))
                                        .onSuccess { 
                                            snack.showSnackbar("Findings saved") 
                                            fetchJobs()
                                        }
                                        .onFailure { err -> snack.showSnackbar(err.message ?: "Failed to save findings") }
                                }
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Save Findings")
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Operational Status", style = MaterialTheme.typography.titleSmall)
                        Spacer(modifier = Modifier.height(8.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                            Button(
                                onClick = { bump(jobId, "on_route", address) },
                                modifier = Modifier.weight(1f),
                                enabled = status != "on_route" && status != "completed"
                            ) {
                                Text("On Route")
                            }
                            Button(
                                onClick = { bump(jobId, "in_progress") },
                                modifier = Modifier.weight(1f),
                                enabled = status != "in_progress" && status != "completed"
                            ) {
                                Text("Arrived")
                            }
                            Button(
                                onClick = { bump(jobId, "completed") },
                                modifier = Modifier.weight(1f),
                                enabled = status != "completed"
                            ) {
                                Text("Finish")
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        OutlinedButton(
                            onClick = { openInMaps(address) },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Open in Maps")
                        }
                    } else {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Tap to view details & actions", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.secondary)
                    }
                }
            }
        }
    }
}
