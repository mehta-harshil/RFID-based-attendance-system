package com.example.testing_application;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        // Wait for 2 seconds (2000 milliseconds) on the splash screen
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            
            // Check if user is already logged in
            SharedPreferences prefs = getSharedPreferences("AppPrefs", Context.MODE_PRIVATE);
            String username = prefs.getString("username", "");

            Intent intent;
            if (!username.isEmpty()) {
                // If username is saved, go directly to Dashboard
                intent = new Intent(SplashActivity.this, DashboardActivity.class);
            } else {
                // Otherwise, go to Login
                intent = new Intent(SplashActivity.this, LoginActivity.class);
            }

            startActivity(intent);
            finish(); // Close SplashActivity so user can't go back to it
            
        }, 2000);
    }
}
