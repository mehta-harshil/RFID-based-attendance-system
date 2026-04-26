package com.example.Present_Sir;

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
    private static final String DASHBOARD_URL = "https://rfid-based-attendance-system.vercel.app/#!/dashboard";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);

        webViewDashboard = findViewById(R.id.webViewDashboard);

        // Enable JavaScript and DOM storage for AngularJS
        WebSettings webSettings = webViewDashboard.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        // Get username saved during login
        SharedPreferences prefs = getSharedPreferences("AppPrefs", Context.MODE_PRIVATE);
        final String username = prefs.getString("username", "");

        if (!username.isEmpty()) {
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            cookieManager.setAcceptThirdPartyCookies(webViewDashboard, true);

            // Android CookieManager is port-sensitive.
            // The frontend (AngularJS) runs on port 3000 and reads document.cookie,
            // so the cookie MUST be set for the exact port-3000 origin.
            String cookieValue = "username=" + username + "; path=/; max-age=86400";
            cookieManager.setCookie("https://rfid-based-attendance-system.vercel.app", cookieValue);

            // Also set for port 5000 so backend API calls from AngularJS carry the cookie too
            cookieManager.setCookie("https://rfid-based-attendance-system-production.up.railway.app", cookieValue);

            // Flush to disk immediately before loadUrl
            cookieManager.flush();
        }

        webViewDashboard.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);

                // Belt-and-suspenders: inject the cookie directly via JavaScript.
                // This guarantees AngularJS sees the cookie regardless of any
                // CookieManager sync delay, because it writes document.cookie
                // from within the page's own JS context.
                if (!username.isEmpty()) {
                    String js = "document.cookie = 'username=" + username
                            + "; path=/; max-age=86400';";
                    view.evaluateJavascript(js, null);
                }
            }
        });

        // Handle JavaScript popups (alert, confirm, prompt)
        webViewDashboard.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
                Toast.makeText(DashboardActivity.this, message, Toast.LENGTH_LONG).show();
                result.confirm();
                return true;
            }

            @Override
            public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
                Toast.makeText(DashboardActivity.this, message, Toast.LENGTH_LONG).show();
                result.confirm();
                return true;
            }

            @Override
            public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, JsPromptResult result) {
                Toast.makeText(DashboardActivity.this, message, Toast.LENGTH_LONG).show();
                result.confirm(defaultValue);
                return true;
            }
        });

        webViewDashboard.loadUrl(DASHBOARD_URL);
    }

    @Override
    public void onBackPressed() {
        if (webViewDashboard.canGoBack()) {
            webViewDashboard.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
