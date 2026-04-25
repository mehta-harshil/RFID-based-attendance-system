package com.example.testing_application;

import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.textfield.TextInputEditText;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class SignupActivity extends AppCompatActivity {

    private LinearLayout layoutStep1, layoutStep2, layoutFilePicker;
    private TextInputEditText etEmail, etAdminName, etUsername, etPassword;
    private TextInputEditText etModuleId, etOrgName;
    private Button btnNext, btnBack, btnSignup;
    private TextView tvLogin, tvFileName;
    
    private Uri selectedFileUri = null;
    private ExecutorService executorService;
    private Handler mainHandler;

    private static final String BASE_URL = "http://192.168.0.121:5000/api/auth";
    private static final int PICK_FILE_REQUEST = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signup);

        executorService = Executors.newSingleThreadExecutor();
        mainHandler = new Handler(Looper.getMainLooper());

        // Step 1 UI
        layoutStep1 = findViewById(R.id.layoutStep1);
        etEmail = findViewById(R.id.etEmail);
        etAdminName = findViewById(R.id.etAdminName);
        etUsername = findViewById(R.id.etUsername);
        etPassword = findViewById(R.id.etPassword);
        btnNext = findViewById(R.id.btnNext);

        // Step 2 UI
        layoutStep2 = findViewById(R.id.layoutStep2);
        etModuleId = findViewById(R.id.etModuleId);
        etOrgName = findViewById(R.id.etOrgName);
        layoutFilePicker = findViewById(R.id.layoutFilePicker);
        tvFileName = findViewById(R.id.tvFileName);
        btnBack = findViewById(R.id.btnBack);
        btnSignup = findViewById(R.id.btnSignup);

        tvLogin = findViewById(R.id.tvLogin);

        btnNext.setOnClickListener(v -> {
            if (validateStep1()) {
                layoutStep1.setVisibility(View.GONE);
                layoutStep2.setVisibility(View.VISIBLE);
            } else {
                Toast.makeText(this, "Please fill all required fields in Step 1", Toast.LENGTH_SHORT).show();
            }
        });

        btnBack.setOnClickListener(v -> {
            layoutStep2.setVisibility(View.GONE);
            layoutStep1.setVisibility(View.VISIBLE);
        });

        layoutFilePicker.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
            intent.setType("*/*");
            startActivityForResult(intent, PICK_FILE_REQUEST);
        });

        btnSignup.setOnClickListener(v -> submitSignup());

        tvLogin.setOnClickListener(v -> {
            Intent intent = new Intent(SignupActivity.this, LoginActivity.class);
            startActivity(intent);
            finish();
        });
    }

    private boolean validateStep1() {
        return !etEmail.getText().toString().trim().isEmpty() &&
               !etAdminName.getText().toString().trim().isEmpty() &&
               !etUsername.getText().toString().trim().isEmpty() &&
               !etPassword.getText().toString().trim().isEmpty();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_FILE_REQUEST && resultCode == RESULT_OK && data != null && data.getData() != null) {
            selectedFileUri = data.getData();
            tvFileName.setText("File Selected: " + selectedFileUri.getLastPathSegment());
            tvFileName.setTextColor(Color.parseColor("#198754")); // Success green
        }
    }

    private void submitSignup() {
        if (etModuleId.getText().toString().trim().isEmpty() || etOrgName.getText().toString().trim().isEmpty()) {
            Toast.makeText(this, "Please fill all required fields in Step 2", Toast.LENGTH_SHORT).show();
            return;
        }

        btnSignup.setEnabled(false);

        executorService.execute(() -> {
            try {
                String boundary = "Boundary-" + System.currentTimeMillis();
                URL url = new URL(BASE_URL + "/register");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setDoOutput(true);
                conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

                DataOutputStream request = new DataOutputStream(conn.getOutputStream());

                // Add form fields
                addFormField(request, boundary, "email", etEmail.getText().toString().trim());
                addFormField(request, boundary, "adminName", etAdminName.getText().toString().trim());
                addFormField(request, boundary, "username", etUsername.getText().toString().trim());
                addFormField(request, boundary, "password", etPassword.getText().toString().trim());
                addFormField(request, boundary, "moduleId", etModuleId.getText().toString().trim());
                addFormField(request, boundary, "orgName", etOrgName.getText().toString().trim());

                // Add file if selected
                if (selectedFileUri != null) {
                    addFilePart(request, boundary, "logo", selectedFileUri);
                }

                request.writeBytes("--" + boundary + "--\r\n");
                request.flush();
                request.close();

                int responseCode = conn.getResponseCode();

                if (responseCode == HttpURLConnection.HTTP_CREATED || responseCode == HttpURLConnection.HTTP_OK) {
                    mainHandler.post(() -> {
                        Toast.makeText(SignupActivity.this, "Signup successful! Redirecting...", Toast.LENGTH_SHORT).show();
                        Intent intent = new Intent(SignupActivity.this, LoginActivity.class);
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

                    String errMsg = "Server error";
                    try {
                        JSONObject errObj = new JSONObject(errorResponse.toString());
                        if (errObj.has("message")) {
                            errMsg = errObj.getString("message");
                        }
                    } catch (JSONException ignored) {}

                    final String finalErrMsg = errMsg;
                    mainHandler.post(() -> {
                        btnSignup.setEnabled(true);
                        Toast.makeText(SignupActivity.this, "Signup failed: " + finalErrMsg, Toast.LENGTH_LONG).show();
                    });
                }
                conn.disconnect();

            } catch (Exception e) {
                e.printStackTrace();
                mainHandler.post(() -> {
                    btnSignup.setEnabled(true);
                    Toast.makeText(SignupActivity.this, "Error connecting to server.", Toast.LENGTH_SHORT).show();
                });
            }
        });
    }

    private void addFormField(DataOutputStream request, String boundary, String name, String value) throws Exception {
        request.writeBytes("--" + boundary + "\r\n");
        request.writeBytes("Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n");
        request.write((value + "\r\n").getBytes("UTF-8"));
    }

    private void addFilePart(DataOutputStream request, String boundary, String fieldName, Uri fileUri) throws Exception {
        request.writeBytes("--" + boundary + "\r\n");
        request.writeBytes("Content-Disposition: form-data; name=\"" + fieldName + "\"; filename=\"" + fileUri.getLastPathSegment() + "\"\r\n");
        request.writeBytes("Content-Type: application/octet-stream\r\n\r\n");

        InputStream inputStream = getContentResolver().openInputStream(fileUri);
        if (inputStream != null) {
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                request.write(buffer, 0, bytesRead);
            }
            inputStream.close();
        }
        request.writeBytes("\r\n");
    }
}
