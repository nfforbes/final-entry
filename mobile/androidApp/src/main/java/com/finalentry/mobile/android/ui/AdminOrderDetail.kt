package com.finalentry.mobile.android.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.finalentry.mobile.FinalEntrySdk
import com.finalentry.mobile.model.AdminJobPatchBody
import com.finalentry.mobile.model.UserProfileDto
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonObject

private val OrderStatuses =
    listOf(
        "rfq",
        "quote_sent",
        "order_confirmed",
        "assigned",
        "on_route",
        "in_progress",
        "signed_off",
        "completed",
        "billed",
        "closed",
        "cancelled",
    )

private fun statusTitle(status: String): String =
    status.replace('_', ' ').replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }

private fun statusHint(status: String): String =
    when (status) {
        "rfq" -> "New request. No extra details."
        "quote_sent" -> "Enter the price to send the quote."
        "order_confirmed" -> "Set the visit date."
        "assigned" -> "Choose the technician who will do the work."
        "on_route" -> "The technician is on the way. No extra details."
        "in_progress" -> "Work is underway. No extra details."
        "signed_off" -> "The customer has signed off."
        "completed" -> "The work is finished."
        "billed" -> "Enter the amount to bill."
        "closed" -> "Close this order."
        "cancelled" -> "Cancel this order."
        else -> ""
    }

internal fun JsonObject.refText(key: String, field: String): String {
    val child = this[key] as? JsonObject ?: return optText(key)
    if (field == "_id") {
        val id = child.mongoId()
        if (id.isNotBlank()) return id
    }
    val text = child.optText(field)
    return text.ifBlank { optText(key) }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun AdminOrderDetail(
    sdk: FinalEntrySdk,
    job: JsonObject,
    technicians: List<UserProfileDto>,
    snack: SnackbarHostState,
    onAuthFailure: () -> Unit,
    onBack: () -> Unit,
    onChanged: suspend () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val jobId = job.mongoId()
    val savedStatus = job.optText("status").ifBlank { "rfq" }
    val savedTechId = job.refText("technicianId", "_id")
    var selectedStatus by remember(jobId, savedStatus) { mutableStateOf(savedStatus) }
    var price by remember(jobId, job.optText("quotedPrice")) { mutableStateOf(job.optText("quotedPrice")) }
    var schedule by remember(jobId, job.optText("scheduledDate")) {
        mutableStateOf(job.optText("scheduledDate").take(10))
    }
    var techId by remember(jobId, savedTechId) { mutableStateOf(savedTechId) }
    var busy by remember { mutableStateOf(false) }
    var notice by remember { mutableStateOf<String?>(null) }
    var statusOpen by remember { mutableStateOf(false) }
    var techOpen by remember { mutableStateOf(false) }

    val techName =
        technicians.firstOrNull { it.id == techId }?.name
            ?: job.refText("technicianId", "name").takeIf { techId == savedTechId && it.isNotBlank() }
            ?: "Select a technician"

    BackHandler(onBack = onBack)

    fun apply(body: AdminJobPatchBody, done: String) {
        if (jobId.isBlank() || busy) return
        scope.launch {
            busy = true
            notice = null
            sdk.patchAdminJob(jobId, body)
                .onSuccess {
                    snack.showSnackbar(done)
                    onChanged()
                }
                .onFailure { err ->
                    notice = err.message ?: "Could not update this order"
                    scope.handleSdkFailure(err, snack, onAuthFailure, "Could not update this order")
                }
            busy = false
        }
    }

    Column(Modifier.fillMaxWidth()) {
        IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back to orders")
        }
        Text(
            job.optText("contactName").ifBlank { "Order" },
            style = MaterialTheme.typography.headlineSmall,
        )
        Spacer(Modifier.height(12.dp))

        Card(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp)) {
                Text("Order details", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(12.dp))
                DetailLine("Service", job.refText("serviceId", "title").ifBlank { "Pest control" })
                DetailLine("Concern", job.optText("pestDescription"))
                DetailLine("Address", job.optText("address"))
                DetailLine("Parish", job.optText("parish"))
                DetailLine("Phone", job.optText("contactPhone"))
                DetailLine("Email", job.optText("contactEmail"))
                DetailLine("Urgency", job.optText("urgency"))
                DetailLine("Current status", statusTitle(savedStatus))
                DetailLine("Price", job.optText("quotedPrice").let { if (it.isBlank()) "" else "$$it" })
                DetailLine("Scheduled", job.optText("scheduledDate").take(10))
                DetailLine("Technician", job.refText("technicianId", "name").ifBlank { "Unassigned" })
            }
        }

        Spacer(Modifier.height(16.dp))

        Card(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp)) {
                Text("Status", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(12.dp))
                PickerField(
                    label = "Status",
                    value = statusTitle(selectedStatus),
                    enabled = !busy,
                    onClick = { statusOpen = true },
                )
                Text(
                    statusHint(selectedStatus),
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 8.dp, bottom = 8.dp),
                )

                when (selectedStatus) {
                    "quote_sent" ->
                        OutlinedTextField(
                            value = price,
                            onValueChange = { price = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Quoted price") },
                            singleLine = true,
                            enabled = !busy,
                        )
                    "billed" ->
                        OutlinedTextField(
                            value = price,
                            onValueChange = { price = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Final amount") },
                            singleLine = true,
                            enabled = !busy,
                        )
                    "order_confirmed" ->
                        OutlinedTextField(
                            value = schedule,
                            onValueChange = { schedule = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Visit date (YYYY-MM-DD)") },
                            singleLine = true,
                            enabled = !busy,
                        )
                    "assigned" ->
                        PickerField(
                            label = "Technician",
                            value = techName,
                            enabled = !busy,
                            onClick = { techOpen = true },
                        )
                }

                Button(
                    onClick = {
                        when (selectedStatus) {
                            "quote_sent", "billed" -> {
                                val amount = price.trim().toDoubleOrNull()
                                if (amount == null) {
                                    notice = "Enter a price."
                                } else {
                                    apply(
                                        AdminJobPatchBody(status = selectedStatus, quotedPrice = amount),
                                        if (selectedStatus == "quote_sent") "Quote sent" else "Marked billed",
                                    )
                                }
                            }
                            "assigned" -> {
                                if (techId.isBlank()) {
                                    notice = "Choose a technician."
                                } else {
                                    apply(
                                        AdminJobPatchBody(status = "assigned", technicianId = techId),
                                        "Technician assigned",
                                    )
                                }
                            }
                            "order_confirmed" -> {
                                if (schedule.isBlank()) {
                                    notice = "Enter a visit date as YYYY-MM-DD."
                                } else {
                                    apply(
                                        AdminJobPatchBody(status = "order_confirmed", scheduledDate = schedule.trim()),
                                        "Order confirmed",
                                    )
                                }
                            }
                            else -> apply(AdminJobPatchBody(status = selectedStatus), statusTitle(selectedStatus))
                        }
                    },
                    enabled = !busy,
                    modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                ) {
                    Text(if (busy) "Saving…" else "Save status")
                }

                notice?.let {
                    Text(
                        it,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(top = 8.dp),
                    )
                }
            }
        }
    }

    if (statusOpen) {
        AlertDialog(
            onDismissRequest = { statusOpen = false },
            title = { Text("Status") },
            text = {
                Column(Modifier.height(360.dp).verticalScroll(rememberScrollState())) {
                    OrderStatuses.forEach { option ->
                        Text(
                            statusTitle(option),
                            color =
                                if (option == selectedStatus) {
                                    MaterialTheme.colorScheme.primary
                                } else {
                                    MaterialTheme.colorScheme.onSurface
                                },
                            modifier =
                                Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        selectedStatus = option
                                        notice = null
                                        statusOpen = false
                                    }
                                    .padding(vertical = 12.dp),
                        )
                        HorizontalDivider()
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { statusOpen = false }) { Text("Close") }
            },
        )
    }

    if (techOpen) {
        AlertDialog(
            onDismissRequest = { techOpen = false },
            title = { Text("Technician") },
            text = {
                Column(Modifier.height(360.dp).verticalScroll(rememberScrollState())) {
                    if (technicians.isEmpty()) {
                        Text("No technicians yet. Give someone the technician role under Users.")
                    }
                    technicians.forEach { tech ->
                        val uid = tech.id.orEmpty()
                        Text(
                            tech.name ?: tech.email ?: "Technician",
                            modifier =
                                Modifier
                                    .fillMaxWidth()
                                    .clickable(enabled = uid.isNotBlank()) {
                                        techId = uid
                                        techOpen = false
                                    }
                                    .padding(vertical = 12.dp),
                        )
                        HorizontalDivider()
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { techOpen = false }) { Text("Close") }
            },
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PickerField(
    label: String,
    value: String,
    enabled: Boolean,
    onClick: () -> Unit,
) {
    Box(Modifier.fillMaxWidth().padding(top = 4.dp)) {
        OutlinedTextField(
            value = value,
            onValueChange = {},
            readOnly = true,
            enabled = enabled,
            label = { Text(label) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = false) },
            modifier = Modifier.fillMaxWidth(),
        )
        Box(
            Modifier
                .matchParentSize()
                .clickable(enabled = enabled, onClick = onClick),
        )
    }
}

@Composable
private fun DetailLine(label: String, value: String) {
    if (value.isBlank()) return
    Text(label, style = MaterialTheme.typography.labelMedium)
    Text(value, modifier = Modifier.padding(bottom = 8.dp))
}
