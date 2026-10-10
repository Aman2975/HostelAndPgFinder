package com.example.hostelallotementandpgfinder

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.example.hostelallotementandpgfinder.ui.screens.*
import com.example.hostelallotementandpgfinder.ui.theme.HostelallotementAndPgFinderTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Uncomment the line below to run it ONCE to populate your Firestore database.
        // Then comment it out again so you don't keep adding duplicates!
        // FirebaseDummyDataHelper.populateFirestore()
        
        enableEdgeToEdge()
        setContent {
            HostelallotementAndPgFinderTheme {
                HostelPGApp()
            }
        }
    }
}

@Composable
fun HostelPGApp() {
    var currentScreen by remember { mutableStateOf("login") }
    var selectedArea by remember { mutableStateOf("") }

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        when (currentScreen) {
            "login" -> {
                LoginScreen(
                    onLoginSuccess = { currentScreen = "choice" },
                    onSignupClick = { currentScreen = "signup" }
                )
            }
            "signup" -> {
                SignupScreen(
                    onSignupSuccess = { currentScreen = "choice" },
                    onBackToLogin = { currentScreen = "login" }
                )
            }
            "choice" -> {
                ChoiceScreen(
                    onHostelAllotmentClick = { currentScreen = "hostel_allotment" },
                    onPGFinderClick = { currentScreen = "pg_finder" },
                    onLogout = { currentScreen = "login" }
                )
            }
            "hostel_allotment" -> {
                HostelAllotmentScreen(
                    onBackClick = { currentScreen = "choice" },
                    onSubmitRequest = { hostelName, studentName, studentId, contact, roomType, duration ->
                        // In a real app, this would save to database
                        // For now, just go back to choice screen
                        currentScreen = "choice"
                    }
                )
            }
            "pg_finder" -> {
                PGFinderScreen(
                    onBackClick = { currentScreen = "choice" },
                    onAreaSelect = { area -> selectedArea = area }
                )
            }
        }
    }
}