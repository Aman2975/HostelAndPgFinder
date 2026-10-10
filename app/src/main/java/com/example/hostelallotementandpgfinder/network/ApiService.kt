package com.example.hostelallotementandpgfinder.network

import com.example.hostelallotementandpgfinder.data.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Authentication endpoints
    @POST("auth/register")
    suspend fun register(@Body user: UserRegistration): Response<ApiResponse<UserResponse>>
    
    @POST("auth/login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<ApiResponse<UserResponse>>
    
    @GET("auth/profile")
    suspend fun getProfile(@Header("Authorization") token: String): Response<ApiResponse<User>>
    
    @PUT("auth/profile")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Body user: UserUpdate
    ): Response<ApiResponse<User>>

    // Hostel endpoints
    @GET("hostels")
    suspend fun getHostels(
        @Query("area") area: String? = null,
        @Query("min_price") minPrice: Double? = null,
        @Query("max_price") maxPrice: Double? = null,
        @Query("available_rooms") availableRooms: Boolean? = null
    ): Response<ApiResponse<List<Hostel>>>
    
    @GET("hostels/{id}")
    suspend fun getHostelById(@Path("id") id: Int): Response<ApiResponse<Hostel>>
    
    @GET("hostels/area/{area}")
    suspend fun getHostelsByArea(@Path("area") area: String): Response<ApiResponse<List<Hostel>>>
    
    @GET("hostels/search/{term}")
    suspend fun searchHostels(
        @Path("term") searchTerm: String,
        @Query("area") area: String? = null,
        @Query("min_price") minPrice: Double? = null,
        @Query("max_price") maxPrice: Double? = null
    ): Response<ApiResponse<List<Hostel>>>
    
    @GET("hostels/areas/list")
    suspend fun getHostelAreas(): Response<ApiResponse<List<String>>>

    // PG endpoints
    @GET("pgs")
    suspend fun getPGs(
        @Query("area") area: String? = null,
        @Query("gender") gender: String? = null,
        @Query("min_price") minPrice: Double? = null,
        @Query("max_price") maxPrice: Double? = null,
        @Query("available_spots") availableSpots: Boolean? = null
    ): Response<ApiResponse<List<PG>>>
    
    @GET("pgs/{id}")
    suspend fun getPGById(@Path("id") id: Int): Response<ApiResponse<PG>>
    
    @GET("pgs/area/{area}")
    suspend fun getPGsByArea(@Path("area") area: String): Response<ApiResponse<List<PG>>>
    
    @GET("pgs/search/{term}")
    suspend fun searchPGs(
        @Path("term") searchTerm: String,
        @Query("area") area: String? = null,
        @Query("gender") gender: String? = null,
        @Query("min_price") minPrice: Double? = null,
        @Query("max_price") maxPrice: Double? = null
    ): Response<ApiResponse<List<PG>>>
    
    @GET("pgs/areas/list")
    suspend fun getPGAreas(): Response<ApiResponse<List<String>>>
    
    @GET("pgs/genders/list")
    suspend fun getGenderPreferences(): Response<ApiResponse<List<String>>>

    // Booking endpoints
    @POST("hostels/book")
    suspend fun createHostelBooking(@Body bookingRequest: BookingRequest): Response<ApiResponse<Booking>>
    
    @POST("pgs/book")
    suspend fun createPGBooking(@Body bookingRequest: BookingRequest): Response<ApiResponse<Booking>>

    // Health check
    @GET("health")
    suspend fun healthCheck(): Response<ApiResponse<Map<String, Any>>>
}


