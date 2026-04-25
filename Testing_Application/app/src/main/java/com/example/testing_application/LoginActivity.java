package com.example.testing_application;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.textfield.TextInputEditText;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class LoginActivity extends AppCompatActivity {

    private TextInputEditText etIdentifier, etPassword;
    private TextView tvError, tvForgotPassword, tvSignup;
    private Button btnLogin;
    private ExecutorService executorService;
    private Handler mainHandler;

    // Use 10.0.2.2 for local emulator, or your computer's IP for physical device
    private static final String BASE_URL = "http://192.168.0.121:5000/api/auth";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        executorService = Executors.newSingleThreadExecutor();
        mainHandler = new Handler(Looper.getMainLooper());

        etIdentifier = findViewById(R.id.etIdentifier);
        etPassword = findViewById(R.id.etPassword);
        tvError = findViewById(R.id.tvError);
        tvForgotPassword = findViewById(R.id.tvForgotPassword);
        tvSignup = findViewById(R.id.tvSignup);
        btnLogin = findViewById(R.id.btnLogin);

        btnLogin.setOnClickListener(v -> loginUser());

        tvSignup.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, SignupActivity.class);
            startActivity(intent);
        });

        tvForgotPassword.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, ForgotPasswordActivity.class);
            startActivity(intent);
        });
    }

    private void loginUser() {
        String identifier = etIdentifier.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (identifier.isEmpty() || password.isEmpty()) {
            showError("Please enter both username/email and password.");
            return;
        }

        tvError.setVisibility(View.GONE);
        btnLogin.setEnabled(false);

        executorService.execute(() -> {
            try {
                URL url = new URL(BASE_URL + "/login");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);

                JSONObject jsonBody = new JSONObject();
                jsonBody.put("identifier", identifier);
                jsonBody.put("password", password);

                OutputStream os = conn.getOutputStream();
                os.write(jsonBody.toString().getBytes("UTF-8"));
                os.close();

                int responseCode = conn.getResponseCode();
                
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String inputLine;
                    while ((inputLine = in.readLine()) != null) {
                        response.append(inputLine);
                    }
                    in.close();

                    JSONObject jsonResponse = new JSONObject(response.toString());
                    String username = jsonResponse.getJSONObject("user").getString("username");

                    // Save session data similar to cookie
                    SharedPreferences prefs = getSharedPreferences("AppPrefs", Context.MODE_PRIVATE);
                    prefs.edit().putString("username", username).apply();

                    mainHandler.post(() -> {
                        btnLogin.setEnabled(true);
                        Toast.makeText(LoginActivity.this, "Login Successful", Toast.LENGTH_SHORT).show();
                        // Intent to Dashboard
                        Intent intent = new Intent(LoginActivity.this, DashboardActivity.class);
                        startActivity(intent);
                        finish();
                    });
                } else {
                    BufferedReader errorReader = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
                    StringBuilder errorResponse = new StringBuilder();
                    String errorLine;
                    while ((errorLine = errorReader.readLine()) != null) {
                        errorResponse.append(errorLine);
                    }
                    errorReader.close();

                    String errMsg = "Invalid credentials";
                    try {
                        JSONObject errObj = new JSONObject(errorResponse.toString());
                        if (errObj.has("message")) {
                            errMsg = errObj.getString("message");
                        }
                    } catch (JSONException ignored) {}

                    final String finalErrMsg = errMsg;
                    mainHandler.post(() -> {
                        btnLogin.setEnabled(true);
                        showError(finalErrMsg);
                    });
                }
                conn.disconnect();

            } catch (Exception e) {
                e.printStackTrace();
                mainHandler.post(() -> {
                    btnLogin.setEnabled(true);
                    showError("Error connecting to server.");
                });
            }
        });
    }

    private void showError(String message) {
        tvError.setText(message);
        tvError.setVisibility(View.VISIBLE);
    }
}
