package com.finalentry.mobile.network

import io.ktor.client.engine.HttpClientEngine
import io.ktor.client.engine.android.Android
import java.security.cert.X509Certificate
import javax.net.ssl.X509TrustManager

actual fun createHttpEngine(): HttpClientEngine = Android.create {
    sslManager = { httpsURLConnection ->
        httpsURLConnection.hostnameVerifier = javax.net.ssl.HostnameVerifier { _, _ -> true }
        val trustAllCerts = arrayOf<javax.net.ssl.TrustManager>(object : X509TrustManager {
            override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
            override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
            override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
        })
        val sslContext = javax.net.ssl.SSLContext.getInstance("SSL")
        sslContext.init(null, trustAllCerts, java.security.SecureRandom())
        httpsURLConnection.sslSocketFactory = sslContext.socketFactory
    }
}
