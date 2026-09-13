import java.util.Properties

plugins {
    id("com.android.application")
    kotlin("android")
    kotlin("plugin.compose")
    kotlin("plugin.serialization")
}

fun releaseSigningProp(envKey: String, propKey: String, props: Properties): String? =
    System.getenv(envKey)?.takeIf { it.isNotBlank() }
        ?: props.getProperty(propKey)?.takeIf { it.isNotBlank() }

val releaseSigningProps = Properties().apply {
    val propsFile = rootProject.file("keystore.properties")
    if (propsFile.exists()) {
        propsFile.inputStream().use { load(it) }
    }
}

android {
    namespace = "com.finalentry.mobile.android"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.finalentry.mobile.android"
        minSdk = 26
        targetSdk = 35
        versionCode = 3
        versionName = "1.0.2"
        vectorDrawables { useSupportLibrary = true }
        manifestPlaceholders["appAuthRedirectScheme"] = "finalentry"
        buildConfigField("String", "API_BASE_URL", "\"https://final-entry.vercel.app\"")
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    signingConfigs {
        create("release") {
            val storePath =
                System.getenv("ANDROID_KEYSTORE_PATH")
                    ?: releaseSigningProp("ANDROID_KEYSTORE_PATH", "storeFile", releaseSigningProps)
            if (!storePath.isNullOrBlank()) {
                storeFile = rootProject.file(storePath)
                storePassword =
                    releaseSigningProp("ANDROID_KEYSTORE_PASSWORD", "storePassword", releaseSigningProps)
                keyAlias = releaseSigningProp("ANDROID_KEY_ALIAS", "keyAlias", releaseSigningProps)
                keyPassword =
                    releaseSigningProp("ANDROID_KEY_PASSWORD", "keyPassword", releaseSigningProps)
            }
        }
    }

    buildTypes {
        getByName("release") {
            signingConfigs.findByName("release")?.storeFile?.let {
                signingConfig = signingConfigs.getByName("release")
            }
            isMinifyEnabled = false
        }
    }
    
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

kotlin {
    compilerOptions.jvmTarget.set(
        org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_11,
    )
}

dependencies {
    implementation(project(":shared"))
    implementation(platform("androidx.compose:compose-bom:2024.12.01"))

    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.navigation:navigation-compose:2.8.4")

    implementation("net.openid:appauth:0.11.1")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")

    implementation("com.google.android.gms:play-services-location:21.3.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    debugImplementation("androidx.compose.ui:ui-tooling")
}
