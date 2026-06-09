package com.finalentry.mobile

import com.finalentry.mobile.model.AdminJobPatchBody
import com.finalentry.mobile.model.AdminJobsEnvelopeDto
import com.finalentry.mobile.model.ApiErrorEnvelope
import com.finalentry.mobile.model.CreateCustomerJobRequest
import com.finalentry.mobile.model.InviteRequestDto
import com.finalentry.mobile.model.JobWireDto
import com.finalentry.mobile.model.JobsResponseDto
import com.finalentry.mobile.model.LocationPostDto
import com.finalentry.mobile.model.MeResponseDto
import com.finalentry.mobile.model.PatchRoleDto
import com.finalentry.mobile.model.ServicesResponseDto
import com.finalentry.mobile.model.StatsEnvelopeDto
import com.finalentry.mobile.model.TechnicianJobPatchDto
import com.finalentry.mobile.model.TechnicianJobsResponseDto
import com.finalentry.mobile.model.TrackingPatchDto
import com.finalentry.mobile.model.UsersEnvelopeDto
import com.finalentry.mobile.network.createHttpEngine
import io.ktor.client.HttpClient
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.HttpRequestBuilder
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpHeaders
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

class FinalEntrySdk(private val config: SdkConfig) {

    private val base = config.baseUrl.trimEnd('/')

    private val fmt = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        encodeDefaults = false
    }

    private val client =
        HttpClient(createHttpEngine()) {
            install(ContentNegotiation) { json(fmt) }
        }

    private suspend fun HttpRequestBuilder.applyBearerAuth() {
        val tok = config.bearer() ?: return
        if (tok.isNotBlank()) {
            header(HttpHeaders.Authorization, "Bearer $tok")
        }
    }

    private suspend fun ensureSuccess(resp: HttpResponse, text: String) {
        val ok = resp.status.value in 200..299
        if (!ok) {
            val err = runCatching { fmt.decodeFromString<ApiErrorEnvelope>(text) }
                .getOrNull()?.error
            throw IllegalStateException(err ?: text.ifBlank { resp.status.description })
        }
    }

    suspend fun fetchMe(): Result<MeResponseDto> = runCatching {
        val resp =
            client.get("$base/api/mobile/me") {
                applyBearerAuth()
            }
        val text = resp.bodyAsText()
        ensureSuccess(resp, text)
        fmt.decodeFromString<MeResponseDto>(text)
    }

    suspend fun fetchServices(): Result<ServicesResponseDto> = runCatching {
        val resp = client.get("$base/api/services")
        val text = resp.bodyAsText()
        ensureSuccess(resp, text)
        fmt.decodeFromString<ServicesResponseDto>(text)
    }

    suspend fun fetchCustomerJobs(): Result<JobsResponseDto> = runCatching {
        val resp =
            client.get("$base/api/mobile/customer/jobs") {
                applyBearerAuth()
            }
        val text = resp.bodyAsText()
        ensureSuccess(resp, text)
        fmt.decodeFromString<JobsResponseDto>(text)
    }

    suspend fun createCustomerJob(body: CreateCustomerJobRequest): Result<JobWireDto> = runCatching {
        val resp =
            client.post("$base/api/mobile/customer/jobs") {
                applyBearerAuth()
                setBody(body)
            }
        val text = resp.bodyAsText()
        ensureSuccess(resp, text)
        val obj = fmt.parseToJsonElement(text).jsonObject
        val job = obj["job"] ?: error("Missing job field")
        fmt.decodeFromJsonElement(JobWireDto.serializer(), job)
    }

    suspend fun fetchTechnicianJobs(): Result<TechnicianJobsResponseDto> =
        runCatching {
            val resp =
                client.get("$base/api/mobile/technician/jobs") {
                    applyBearerAuth()
                }
            val text = resp.bodyAsText()
            ensureSuccess(resp, text)
            fmt.decodeFromString<TechnicianJobsResponseDto>(text)
        }

    suspend fun patchTechnicianJob(id: String, patch: TechnicianJobPatchDto): Result<JobWireDto> =
        runCatching {
            val resp =
                client.patch("$base/api/mobile/technician/jobs/$id") {
                    applyBearerAuth()
                    setBody(patch)
                }
            val text = resp.bodyAsText()
            ensureSuccess(resp, text)
            val obj = fmt.parseToJsonElement(text).jsonObject
            val job = obj["job"] ?: error("Missing job")
            fmt.decodeFromJsonElement(JobWireDto.serializer(), job)
        }

    suspend fun postTechnicianLocation(lat: Double, lng: Double, isSharing: Boolean): Result<Unit> =
        runCatching {
            val resp =
                client.post("$base/api/mobile/technician/location") {
                    applyBearerAuth()
                    setBody(LocationPostDto(lat, lng, isSharing))
                }
            val text = resp.bodyAsText()
            ensureSuccess(resp, text)
        }

    suspend fun fetchAdminStats(): Result<StatsEnvelopeDto> =
        runCatching {
            val resp =
                client.get("$base/api/mobile/admin/dashboard") {
                    applyBearerAuth()
                }
            val text = resp.bodyAsText()
            ensureSuccess(resp, text)
            fmt.decodeFromString<StatsEnvelopeDto>(text)
        }

    suspend fun fetchAdminJobs(): Result<AdminJobsEnvelopeDto> =
        runCatching {
            val resp =
                client.get("$base/api/mobile/admin/jobs") {
                    applyBearerAuth()
                }
            val text = resp.bodyAsText()
            ensureSuccess(resp, text)
            fmt.decodeFromString<AdminJobsEnvelopeDto>(text)
        }

    suspend fun patchAdminJob(id: String, patch: AdminJobPatchBody): Result<JsonElement> =
        runCatching {
            val resp =
                client.patch("$base/api/mobile/admin/jobs/$id") {
                    applyBearerAuth()
                    setBody(patch)
                }
            val text = resp.bodyAsText()
            ensureSuccess(resp, text)
            val obj = fmt.parseToJsonElement(text).jsonObject
            obj["job"] ?: error("Missing job")
        }

    suspend fun fetchAdminUsers(role: String? = null): Result<UsersEnvelopeDto> =
        runCatching {
            val q = role?.takeIf { it.isNotBlank() }?.let { "?role=${it.trim()}" } ?: ""
            val resp =
                client.get("$base/api/mobile/admin/users$q") {
                    applyBearerAuth()
                }
            val text = resp.bodyAsText()
            ensureSuccess(resp, text)
            fmt.decodeFromString<UsersEnvelopeDto>(text)
        }

    suspend fun inviteUser(email: String, role: String): Result<Unit> = runCatching {
        val resp =
            client.post("$base/api/mobile/admin/users/invite") {
                applyBearerAuth()
                setBody(InviteRequestDto(email, role))
            }
        val text = resp.bodyAsText()
        ensureSuccess(resp, text)
    }

    suspend fun patchUserRole(userId: String, role: String): Result<Unit> = runCatching {
        val resp =
            client.patch("$base/api/mobile/admin/users/$userId") {
                applyBearerAuth()
                setBody(PatchRoleDto(role))
            }
        val text = resp.bodyAsText()
        ensureSuccess(resp, text)
    }

    suspend fun deleteAdminUser(userId: String): Result<Unit> = runCatching {
        val resp =
            client.delete("$base/api/mobile/admin/users/$userId") {
                applyBearerAuth()
            }
        val text = resp.bodyAsText()
        ensureSuccess(resp, text)
    }

    suspend fun fetchIntegrationStatus(): Result<JsonObject> = runCatching {
        val resp =
            client.get("$base/api/mobile/admin/settings/integrations") {
                applyBearerAuth()
            }
        val text = resp.bodyAsText()
        ensureSuccess(resp, text)
        fmt.parseToJsonElement(text).jsonObject
    }

    suspend fun trackingSnapshot(token: String): Result<JsonObject> = runCatching {
        val resp = client.get("$base/api/tracking/${token.trim()}")
        val text = resp.bodyAsText()
        ensureSuccess(resp, text)
        fmt.parseToJsonElement(text).jsonObject
    }

    suspend fun submitTrackingSignature(
        token: String,
        payload: TrackingPatchDto,
    ): Result<String> =
        runCatching {
            val resp =
                client.patch("$base/api/tracking/${token.trim()}") { setBody(payload) }
            val text = resp.bodyAsText()
            ensureSuccess(resp, text)
            val obj = fmt.parseToJsonElement(text).jsonObject
            obj["status"]?.jsonPrimitive?.content ?: text
        }
}
