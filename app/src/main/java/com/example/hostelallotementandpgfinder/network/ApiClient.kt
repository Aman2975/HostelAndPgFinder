package com.example.hostelallotementandpgfinder.network

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    // Base URL - Try these different options:
    private const val BASE_URL = "http://10.53.51.182:5002/api/" // Your wireless network IP
    // Alternative URLs to try if 10.0.2.2 doesn't work:
    // private const val BASE_URL = "http://127.0.0.1:5002/api/" // Localhost
    // private const val BASE_URL = "http://localhost:5002/api/" // Localhost
    // private const val BASE_URL = "http://192.168.23.1:5002/api/" // Your computer's IP (WiFi)
    // private const val BASE_URL = "http://10.230.118.182:5002/api/" // Your computer's IP (Ethernet)
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val apiService: ApiService = retrofit.create(ApiService::class.java)
}

