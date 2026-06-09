package com.finalentry.mobile.network

import io.ktor.client.engine.HttpClientEngine

expect fun createHttpEngine(): HttpClientEngine
