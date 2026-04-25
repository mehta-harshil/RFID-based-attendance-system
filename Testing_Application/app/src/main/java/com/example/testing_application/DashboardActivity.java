package com.example.testing_application;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.JsResult;
import android.webkit.JsPromptResult;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class DashboardActivity extends AppCompatActivity {

    private WebView webViewDashboard;
    // You can adjust this URL to match your exact dashboard route served by Node.js
    private static final String DASHBOARD_URL = "http://192.168.0.121:3000/#!/dashboard";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);

        webViewDashboard = findViewById(R.id.webViewDashboard);

        // Enable JavaScript and local storage for AngularJS routing and functionality
        WebSettings webSettings = webViewDashboard.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        // Get username from SharedPreferences saved during login
        SharedPreferences prefs = getSharedPreferences("AppPrefs", Context.MODE_PRIVATE);
        String username = prefs.getString("username", "");

        if (!username.isEmpty()) {
            // Set the "username" cookie for the backend/frontend domain
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            // Must use the base domain
            cookieManager.setCookie("http://192.168.0.121:3000", "username=" + username);
            // Allow cookies within WebView
            cookieManager.setAcceptThirdPartyCookies(webViewDashboard, true);
            cookieManager.flush();
        }

        // Force links and redirects to open in the WebView instead of external browser
        webViewDashboard.setWebViewClient(new WebViewClient());

        // Handle JavaScript popups (alert, confirm, prompt)
        webViewDashboard.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
                Toast.makeText(DashboardActivity.this, message, Toast.LENGTH_LONG).show();
                result.confirm(); // Auto-accept the alert
                return true;
            }

            @Override
            public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
                Toast.makeText(DashboardActivity.this, message, Toast.LENGTH_LONG).show();
                result.confirm(); // Auto-accept the confirm
                return true;
            }

            @Override
            public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, JsPromptResult result) {
                Toast.makeText(DashboardActivity.this, message, Toast.LENGTH_LONG).show();
                result.confirm(defaultValue); // Auto-accept the prompt with default value
                return true;
            }
        });

        // Load the URL
        webViewDashboard.loadUrl(DASHBOARD_URL);
    }

    // Handle back button to go back in WebView history if possible
    @Override
    public void onBackPressed() {
        if (webViewDashboard.canGoBack()) {
            webViewDashboard.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
