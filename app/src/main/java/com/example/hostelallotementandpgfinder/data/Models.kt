package com.example.hostelallotementandpgfinder.data

// Local data models for UI (simplified versions)
data class HostelAllotmentRequest(
    val hostelName: String,
    val studentName: String,
    val studentId: String,
    val contact: String,
    val preferredRoomType: String,
    val duration: String
)

// Note: User, Hostel, and PG models are now defined in ApiModels.kt
// to match the API structure and avoid redeclaration errors
