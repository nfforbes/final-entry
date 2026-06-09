package com.finalentry.mobile.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class UserProfileDto(
    @SerialName("_id") val id: String? = null,
    val auth0Id: String? = null,
    val name: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val role: String? = null,
    val parish: String? = null,
    val address: String? = null,
)

@Serializable
data class MeResponseDto(val profile: UserProfileDto? = null, val role: String? = null)

@Serializable
data class NamedRefDto(val name: String? = null)

@Serializable
data class JobsResponseDto(val jobs: List<JsonElement> = emptyList())

@Serializable
data class TechnicianJobsResponseDto(
    val success: Boolean = true,
    val jobs: List<JsonElement> = emptyList(),
)

@Serializable
data class AdminJobsEnvelopeDto(val jobs: List<JsonElement> = emptyList())

@Serializable
data class StatsEnvelopeDto(val stats: List<DashboardStatWireDto>)

@Serializable
data class DashboardStatWireDto(val label: String, val value: String, val trend: String? = null, val type: String? = null)

@Serializable
data class UsersEnvelopeDto(val users: List<UserProfileDto>)

@Serializable
data class ServiceLiteDto(
    val slug: String? = null,
    val title: String? = null,
    val _id: String? = null,
)

@Serializable
data class ServicesResponseDto(val services: List<ServiceLiteDto>)

@Serializable
data class InviteRequestDto(val email: String, val role: String)

@Serializable
data class ApiErrorEnvelope(val error: String? = null)

@Serializable
data class TechnicianJobPatchDto(
    val status: String? = null,
    val technicianNotes: String? = null,
)

@Serializable
data class LocationPostDto(val lat: Double, val lng: Double, val isSharing: Boolean? = true)

@Serializable
data class TrackingPatchDto(
    val status: String = "signed_off",
    val signedOffBy: String? = null,
    val signatureImage: String,
)

@Serializable
data class AdminJobPatchBody(
    val status: String? = null,
    val technicianId: String? = null,
    val quotedPrice: Double? = null,
    val scheduledDate: String? = null,
    val attachment: AttachmentWireDto? = null,
)

@Serializable
data class AttachmentWireDto(
    val filename: String,
    val data: String,
    val contentType: String? = null,
)

@Serializable
data class PatchRoleDto(val role: String)

@Serializable
data class JobWireDto(
    @SerialName("_id") val id: String? = null,
    val status: String? = null,
    val parish: String? = null,
    val address: String? = null,
    val pestDescription: String? = null,
    val urgency: String? = null,
    val contactName: String? = null,
    val contactEmail: String? = null,
    val contactPhone: String? = null,
    val quotedPrice: Double? = null,
    val scheduledDate: String? = null,
    val technicianNotes: String? = null,
    val trackingToken: String? = null,
)

@Serializable
data class CreateCustomerJobRequest(
    val serviceId: String,
    val parish: String,
    val address: String,
    val pestDescription: String,
    val urgency: String = "medium",
    val contactName: String,
    val contactEmail: String,
    val contactPhone: String,
)
