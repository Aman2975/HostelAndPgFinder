package com.example.hostelallotementandpgfinder.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.hostelallotementandpgfinder.data.*
import com.google.firebase.firestore.FirebaseFirestore

@Composable
fun PGFinderScreen(
    onBackClick: () -> Unit,
    onAreaSelect: (String) -> Unit
) {
    var selectedArea by remember { mutableStateOf("") }
    var showPGs by remember { mutableStateOf(false) }
    var pgs by remember { mutableStateOf<List<PG>>(emptyList()) }
    var filteredPGs by remember { mutableStateOf<List<PG>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var showBookingDialog by remember { mutableStateOf(false) }
    var selectedPG by remember { mutableStateOf<PG?>(null) }

    val availableAreas = listOf("Bhadurgarh", "Phase 1", "Phase 2", "Near PUP", "Patiala City")

    // Load PGs from Firestore when area is selected
    LaunchedEffect(selectedArea) {
        if (selectedArea.isNotEmpty()) {
            isLoading = true
            errorMessage = ""
            
            val db = FirebaseFirestore.getInstance()
            db.collection("pgs").whereEqualTo("area", selectedArea).get()
                .addOnSuccessListener { result ->
                    val loadedPgs = mutableListOf<PG>()
                    for (document in result) {
                        try {
                            val pg = PG(
                                id = document.id.hashCode(),
                                name = document.getString("name") ?: "",
                                area = document.getString("area") ?: "",
                                location = document.getString("location") ?: "",
                                available_spots = document.getLong("available_spots")?.toInt() ?: 0,
                                total_spots = document.getLong("total_spots")?.toInt() ?: 0,
                                price_per_month = document.get("price_per_month")?.toString() ?: "0",
                                gender_preference = document.getString("gender_preference") ?: "",
                                amenities = document.getString("amenities"),
                                contact_number = document.getString("contact_number"),
                                description = document.getString("description"),
                                image_url = document.getString("image_url"),
                                is_active = document.getLong("is_active")?.toInt() ?: 1,
                                created_at = document.getString("created_at"),
                                updated_at = document.getString("updated_at")
                            )
                            loadedPgs.add(pg)
                        } catch (e: Exception) {
                            // Skip invalid documents
                        }
                    }
                    pgs = loadedPgs
                    filteredPGs = loadedPgs // Already filtered by Firestore query
                    showPGs = true
                    isLoading = false
                }
                .addOnFailureListener { e ->
                    errorMessage = "Failed to load PGs: ${e.message}"
                    isLoading = false
                }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onBackClick) {
                Text("← Back")
            }
            Spacer(modifier = Modifier.weight(1f))
            Text(
                text = "PG Finder",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            // Error message
            if (errorMessage.isNotEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
                ) {
                    Text(
                        text = errorMessage,
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            if (!showPGs) {
                // Area Selection
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(rememberScrollState())
                            .padding(16.dp)
                    ) {
                        Text(
                            text = "Select Area to Find PGs",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text("Choose an area to see available PGs:", fontWeight = FontWeight.Medium)
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Column(modifier = Modifier.selectableGroup()) {
                            availableAreas.forEach { area ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .selectable(
                                            selected = (selectedArea == area),
                                            onClick = { selectedArea = area }
                                        )
                                        .padding(vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    RadioButton(
                                        selected = (selectedArea == area),
                                        onClick = { selectedArea = area }
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(
                                        text = area,
                                        fontSize = 16.sp
                                    )
                                }
                            }
                        }
                    }
                }
            } else {
                // Show PGs
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "PGs in $selectedArea",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.weight(1f))
                            TextButton(onClick = { 
                                showPGs = false
                                selectedArea = ""
                                pgs = emptyList()
                                filteredPGs = emptyList()
                            }) {
                                Text("Change Area")
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Found ${filteredPGs.size} PGs available")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (filteredPGs.isEmpty()) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Text(
                            text = "No PGs available in $selectedArea at the moment.",
                            modifier = Modifier.padding(16.dp),
                            textAlign = TextAlign.Center
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(filteredPGs) { pg ->
                            PGItem(
                                pg = pg,
                                onBookClick = {
                                    selectedPG = pg
                                    showBookingDialog = true
                                }
                            )
                        }
                    }
                }
            }
        }
    }

    // Booking Dialog
    if (showBookingDialog && selectedPG != null) {
        PGBookingDialog(
            pg = selectedPG!!,
            onDismiss = { 
                showBookingDialog = false
                selectedPG = null
            },
            onBook = { studentName, studentId, contact, email, moveInDate, duration ->
                // Handle booking
                val db = FirebaseFirestore.getInstance()
                val bookingData = hashMapOf(
                    "student_id" to studentId,
                    "student_name" to studentName,
                    "contact" to contact,
                    "email" to email,
                    "move_in_date" to moveInDate,
                    "duration" to duration,
                    "property_id" to selectedPG!!.id,
                    "property_type" to "pg",
                    "status" to "pending",
                    "created_at" to com.google.firebase.Timestamp.now()
                )
                
                db.collection("bookings").add(bookingData)
                    .addOnSuccessListener {
                        showBookingDialog = false
                        selectedPG = null
                        // Show success message
                    }
                    .addOnFailureListener { e ->
                        // Handle error
                    }
            }
        )
    }
}

@Composable
fun PGItem(pg: PG, onBookClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = pg.name,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "📍 ${pg.location}",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "🏘️ ${pg.area}",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Text(
                    text = "₹${pg.price_per_month}/month",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "👥 ${pg.gender_preference} • ${pg.available_spots} spots",
                    fontSize = 14.sp
                )
                if (pg.contact_number != null) {
                    Text(
                        text = "📞 ${pg.contact_number}",
                        fontSize = 14.sp
                    )
                }
            }

            if (!pg.amenities.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "🏠 Amenities: ${pg.amenities}",
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (!pg.description.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = pg.description,
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = onBookClick,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Book This PG")
            }
        }
    }
}

@Composable
fun PGBookingDialog(
    pg: PG,
    onDismiss: () -> Unit,
    onBook: (String, String, String, String, String, String) -> Unit
) {
    var studentName by remember { mutableStateOf("") }
    var studentId by remember { mutableStateOf("") }
    var contact by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var moveInDate by remember { mutableStateOf("") }
    var duration by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Book ${pg.name}") },
        text = {
            Column {
                Text("Fill in your details to book this PG:")
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = studentName,
                    onValueChange = { studentName = it },
                    label = { Text("Full Name *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = studentId,
                    onValueChange = { studentId = it },
                    label = { Text("Student ID *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = contact,
                    onValueChange = { contact = it },
                    label = { Text("Phone Number *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = moveInDate,
                    onValueChange = { moveInDate = it },
                    label = { Text("Preferred Move-in Date *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    placeholder = { Text("DD/MM/YYYY") }
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = duration,
                    onValueChange = { duration = it },
                    label = { Text("Duration of Stay *") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    placeholder = { Text("e.g., 6 months, 1 year") }
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (studentName.isNotBlank() && studentId.isNotBlank() && 
                        contact.isNotBlank() && email.isNotBlank() && 
                        moveInDate.isNotBlank() && duration.isNotBlank()) {
                        onBook(studentName, studentId, contact, email, moveInDate, duration)
                    }
                }
            ) {
                Text("Book Now")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}