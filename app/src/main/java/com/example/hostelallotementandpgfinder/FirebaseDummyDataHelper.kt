package com.example.hostelallotementandpgfinder

import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore

object FirebaseDummyDataHelper {
    fun populateFirestore() {
        val db = FirebaseFirestore.getInstance()

        // Dummy PGs
        val pgs = listOf(
            mapOf(
                "name" to "Sunshine Boys PG",
                "area" to "Bhadurgarh",
                "location" to "Near Main Market",
                "available_spots" to 5L,
                "total_spots" to 20L,
                "price_per_month" to "5000",
                "gender_preference" to "Male",
                "amenities" to "WiFi, AC, Food",
                "contact_number" to "9876543210",
                "description" to "Comfortable stay for boys with all amenities.",
                "is_active" to 1L
            ),
            mapOf(
                "name" to "Girls Residency PG",
                "area" to "Patiala City",
                "location" to "Opposite College Gate",
                "available_spots" to 2L,
                "total_spots" to 15L,
                "price_per_month" to "6500",
                "gender_preference" to "Female",
                "amenities" to "WiFi, AC, Laundry",
                "contact_number" to "9876543211",
                "description" to "Safe and secure PG for girls.",
                "is_active" to 1L
            )
        )

        // Dummy Hostels
        val hostels = listOf(
            mapOf(
                "name" to "University Boys Hostel A",
                "area" to "Campus",
                "location" to "North Campus",
                "available_rooms" to 10L,
                "total_rooms" to 100L,
                "price_per_month" to "3000",
                "amenities" to "Mess, Sports Room",
                "contact_number" to "9876543212",
                "description" to "Standard university hostel for boys.",
                "is_active" to 1L
            ),
            mapOf(
                "name" to "City Center Hostel",
                "area" to "Phase 1",
                "location" to "Near Bus Stand",
                "available_rooms" to 5L,
                "total_rooms" to 50L,
                "price_per_month" to "4500",
                "amenities" to "AC, Gym",
                "contact_number" to "9876543213",
                "description" to "Premium hostel in the heart of the city.",
                "is_active" to 1L
            )
        )

        // Add PGs to Firestore
        pgs.forEach { pgData ->
            db.collection("pgs").add(pgData)
                .addOnSuccessListener { Log.d("DummyData", "PG added successfully") }
                .addOnFailureListener { e -> Log.e("DummyData", "Error adding PG", e) }
        }

        // Add Hostels to Firestore
        hostels.forEach { hostelData ->
            db.collection("hostels").add(hostelData)
                .addOnSuccessListener { Log.d("DummyData", "Hostel added successfully") }
                .addOnFailureListener { e -> Log.e("DummyData", "Error adding Hostel", e) }
        }
    }
}
