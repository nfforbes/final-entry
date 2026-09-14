package com.finalentry.mobile.android.ui

import androidx.compose.material3.SnackbarHostState
import com.finalentry.mobile.isUnauthorized
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

fun CoroutineScope.handleSdkFailure(
    err: Throwable,
    snack: SnackbarHostState,
    onAuthFailure: () -> Unit,
    fallback: String,
) {
    if (err.isUnauthorized()) {
        onAuthFailure()
    } else {
        launch { snack.showSnackbar(err.message ?: fallback) }
    }
}

fun handleSdkFailureOrBanner(
    err: Throwable,
    onAuthFailure: () -> Unit,
    onOther: (String) -> Unit,
) {
    if (err.isUnauthorized()) {
        onAuthFailure()
    } else {
        onOther(err.message ?: "Request failed")
    }
}

suspend fun SnackbarHostState.handleSdkFailureSuspending(
    err: Throwable,
    onAuthFailure: () -> Unit,
    fallback: String,
) {
    if (err.isUnauthorized()) {
        onAuthFailure()
    } else {
        showSnackbar(err.message ?: fallback)
    }
}
