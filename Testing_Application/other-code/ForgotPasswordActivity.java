package com.example.miniproject; // Adjust package name as needed

import android.content.Intent;
import android.graphics.Color;
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

public class ForgotPasswordActivity extends AppCompatActivity {

    private TextInputEditText etIdentifier, etNewPassword;
    private TextView tvMessage, tvBackToLogin;
    private Button btnResetPassword;
    
    private ExecutorService executorService;
    private Handler mainHandler;

    private static final String BASE_URL = "http://10.0.2.2:5000/api/auth";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forgot_password);

        executorService = Executors.newSingleThreadExecutor();
        mainHandler = new Handler(Looper.getMainLooper());

        etIdentifier = findViewById(R.id.etIdentifier);
        etNewPassword = findViewById(R.id.etNewPassword);
        tvMessage = findViewById(R.id.tvMessage);
        tvBackToLogin = findViewById(R.id.tvBackToLogin);
        btnResetPassword = findViewById(R.id.btnResetPassword);

        tvBackToLogin.setOnClickListener(v -> finish());

        btnResetPassword.setOnClickListener(v -> resetPassword());
    }

    private void resetPassword() {
        String identifier = etIdentifier.getText().toString().trim();
        String newPassword = etNewPassword.getText().toString().trim();

        if (identifier.isEmpty() || newPassword.isEmpty()) {
            showMessage("Please enter both Username/Email and New Password.", false);
            return;
        }

        btnResetPassword.setEnabled(false);

        executorService.execute(() -> {
            try {
                URL url = new URL(BASE_URL + "/reset-password");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);

                JSONObject jsonBody = new JSONObject();
                jsonBody.put("identifier", identifier);
                jsonBody.put("newPassword", newPassword);

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

                    String successMsg = "Password Reset Successful";
                    try {
                        JSONObject resObj = new JSONObject(response.toString());
                        if (resObj.has("message")) {
                            successMsg = resObj.getString("message");
                        }
                    } catch (JSONException ignored) {}

                    final String finalSuccessMsg = successMsg + ". Redirecting...";

                    mainHandler.post(() -> {
                        showMessage(finalSuccessMsg, true);
                        
                        // Wait 2 seconds and go to login
                        mainHandler.postDelayed(() -> {
                            Intent intent = new Intent(ForgotPasswordActivity.this, LoginActivity.class);
                            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                            startActivity(intent);
                            finish();
                        }, 2000);
                    });
                } else {
                    BufferedReader errorReader = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
                    StringBuilder errorResponse = new StringBuilder();
                    String errorLine;
                    while ((errorLine = errorReader.readLine()) != null) {
                        errorResponse.append(errorLine);
                    }
                    errorReader.close();

                    String errMsg = "Failed to reset password.";
                    try {
                        JSONObject errObj = new JSONObject(errorResponse.toString());
                        if (errObj.has("message")) {
                            errMsg = errObj.getString("message");
                        }
                    } catch (JSONException ignored) {}

                    final String finalErrMsg = errMsg;
                    mainHandler.post(() -> {
                        btnResetPassword.setEnabled(true);
                        showMessage(finalErrMsg, false);
                    });
                }
                conn.disconnect();

            } catch (Exception e) {
                e.printStackTrace();
                mainHandler.post(() -> {
                    btnResetPassword.setEnabled(true);
                    showMessage("Error connecting to server.", false);
                });
            }
        });
    }

    private void showMessage(String message, boolean isSuccess) {
        tvMessage.setText(message);
        if (isSuccess) {
            tvMessage.setTextColor(Color.parseColor("#198754")); // Success Green
        } else {
            tvMessage.setTextColor(Color.parseColor("#DC3545")); // Danger Red
        }
        tvMessage.setVisibility(View.VISIBLE);
    }
}
