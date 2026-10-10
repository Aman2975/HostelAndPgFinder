package com.example.hostelallotementandpgfinder.data

// API Response wrapper
data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T? = null,
    val count: Int? = null,
    val error: String? = null
)

// User Registration Request
data class UserRegistration(
    val student_id: String,
    val name: String,
    val email: String,
    val phone: String? = null,
    val course: String? = null,
    val academic_year: String? = null,
    val password: String
)

// Login Request
data class LoginRequest(
    val student_id: String,
    val password: String
)

// User Response (from API)
data class UserResponse(
    val user: User,
    val token: String
)

// User Update Request
data class UserUpdate(
    val name: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val course: String? = null,
    val academic_year: String? = null
)

// Updated User model for API
data class User(
    val student_id: String,
    val name: String,
    val email: String,
    val phone: String? = null,
    val course: String? = null,
    val academic_year: String? = null,
    val created_at: String? = null
)

// Updated Hostel model for API
data class Hostel(
    val id: Int,
    val name: String,
    val location: String,
    val area: String,
    val available_rooms: Int,
    val total_rooms: Int,
    val price_per_month: String, // Changed from Double to String to handle backend response
    val amenities: String?,
    val contact_number: String?,
    val description: String?,
    val image_url: String?,
    val is_active: Int, // Changed from Boolean to Int to handle 0/1 from backend
    val created_at: String?,
    val updated_at: String?
)

// Updated PG model for API
data class PG(
    val id: Int,
    val name: String,
    val area: String,
    val location: String,
    val available_spots: Int,
    val total_spots: Int,
    val price_per_month: String, // Changed from Double to String to handle backend response
    val gender_preference: String,
    val amenities: String?,
    val contact_number: String?,
    val description: String?,
    val image_url: String?,
    val is_active: Int, // Changed from Boolean to Int to handle 0/1 from backend
    val created_at: String?,
    val updated_at: String?
)

// Booking Request
data class BookingRequest(
    val student_id: String,
    val property_id: Int,
    val property_type: String, // "hostel" or "pg"
    val special_requests: String? = null
)

// Booking Response
data class Booking(
    val id: Int,
    val student_id: String,
    val property_id: Int,
    val property_type: String,
    val booking_date: String,
    val status: String,
    val special_requests: String?
)

// Favorite Request
data class FavoriteRequest(
    val student_id: String,
    val property_id: Int,
    val property_type: String // "hostel" or "pg"
)

// Review Request
data class ReviewRequest(
    val student_id: String,
    val property_id: Int,
    val property_type: String, // "hostel" or "pg"
    val rating: Int,
    val comment: String? = null
)

// Review Response
data class Review(
    val id: Int,
    val student_id: String,
    val property_id: Int,
    val property_type: String,
    val rating: Int,
    val comment: String?,
    val created_at: String
)


