// Micro Attendance System
// Hardware: ESP32 + MFRC522 RFID Sensor + WiFi
// Mode: Online only (WiFi + API) - Auto Attendance Mode

// ============================================================
// SPIFFS JSON file structure:
//   /Connection_and_module.json  = {"wifi":{"SSID":"password"},"module_id":"IT_A"}
// ============================================================

#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <FS.h>
#include <SPIFFS.h>

// ── RFID MFRC522 Pins (Standard ESP32 VSPI) ──
#define RST_PIN   22 // Reset pin
#define SS_PIN    5  // SDA (SS) pin
// Note: MISO = 19, MOSI = 23, SCK = 18

MFRC522 mfrc522(SS_PIN, RST_PIN);

// ── Pin definitions ──
#define BTN_PIN   4    // Button: press to SUBMIT attendance batch
#define LED_RED   25   // Internal error
#define LED_GREEN 26   // WiFi connected
#define LED_BLUE  27   // Configuration mode

// ── Server ──
String BASE_URL   = "https://rfid-based-attendance-system-production.up.railway.app/";
String module_id  = "";

// ============================================================
//  SETUP
// ============================================================
void setup() {
  Serial.begin(115200);

  pinMode(BTN_PIN,   INPUT_PULLUP);
  pinMode(LED_RED,   OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_BLUE,  OUTPUT);

  // 1. RFID sensor check
  SPI.begin();
  mfrc522.PCD_Init();
  delay(4); 
  mfrc522.PCD_DumpVersionToSerial(); 
  Serial.println("RFID sensor initialized.");

  // 2. SPIFFS check
  if (!SPIFFS.begin()) {
    Serial.println("ERROR: SPIFFS mount failed.");
    while (!SPIFFS.begin()) {
      digitalWrite(LED_RED, HIGH); delay(700);
      digitalWrite(LED_RED, LOW);  delay(700);
    }
  }
  Serial.println("SPIFFS OK.");
  
  // Load module_id from saved config
  File f = SPIFFS.open("/Connection_and_module.json", "r");
  if (f) {
    DynamicJsonDocument doc(f.size() * 3);
    deserializeJson(doc, f);
    f.close();
    module_id = doc["module_id"].as<String>();
  }
  Serial.print("Module ID: "); Serial.println(module_id);
  Serial.println("Setup Complete. Entering auto-loop.");
}


// ============================================================
//  LOOP
// ============================================================
void loop() {
  // ── Continuously check WiFi ──
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_GREEN, LOW);
    Serial.println("WiFi disconnected. Attempting to reconnect...");
    connectWiFi();
  } else {
    // WiFi is good, jump straight into attendance scanning!
    digitalWrite(LED_GREEN, HIGH);
    fetchAndSaveConfig();
    attendanceMode();
  }

  // Brief pause before restarting the loop/checking WiFi again
  delay(500);
}


// ============================================================
//  WiFi: connect using credentials in Connection_and_module.json
// ============================================================
void connectWiFi() {
  File f = SPIFFS.open("/Connection_and_module.json", "r");
  if (!f) { Serial.println("Cannot open Connection_and_module.json"); return; }
  DynamicJsonDocument doc(f.size() * 3);
  deserializeJson(doc, f);
  f.close();

  WiFi.mode(WIFI_STA);
  int found = WiFi.scanNetworks();

  for (int i = 0; i < found; i++) {
    String ssid = WiFi.SSID(i);
    if (doc["wifi"].containsKey(ssid)) {
      const char* pass = doc["wifi"][ssid];
      Serial.print("Connecting to "); Serial.println(ssid);
      WiFi.begin(ssid.c_str(), pass);

      unsigned long t = millis();
      while (WiFi.status() != WL_CONNECTED && millis() - t < 8000) {
        delay(300); Serial.print(".");
      }

      if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected.");
        digitalWrite(LED_GREEN, HIGH);
        return;
      }
    }
  }

  Serial.println("\nNo known WiFi network found.");
  digitalWrite(LED_GREEN, LOW);
}


// ============================================================
//  ATTENDANCE MODE
// ============================================================
void attendanceMode() {
  // Note: WiFi checks have been removed from here as requested.
  // It relies entirely on the loop() for network stability.

  // ── Collect RFID UIDs into array ──
  DynamicJsonDocument attDoc(3 * 1024);
  JsonArray ids = attDoc.createNestedArray("ids");

  Serial.println("\n=== Auto Attendance Mode ===");
  Serial.println("Tap RFID cards to record. Press button to SUBMIT batch.");

  while (true) {
    // Check if user wants to exit and submit the current batch
    if (digitalRead(BTN_PIN) == LOW) {
      delay(50);
      if (digitalRead(BTN_PIN) == LOW) {
        Serial.println("Button pressed — submitting attendance batch.");
        break; // Breaks the while loop to proceed to submission
      }
    }

    // Check for RFID card
    if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
      String id = getUIDString();
      
      // Check duplicate in current session
      bool alreadyIn = false;
      for (JsonVariant v : ids) {
        if (v.as<String>() == id) { alreadyIn = true; break; }
      }
      
      if (!alreadyIn) {
        ids.add(id);
        Serial.print("Recorded ID: "); Serial.println(id);
      } else {
        Serial.println("Already recorded in this batch.");
      }
      
      mfrc522.PICC_HaltA(); // Stop reading the same card immediately
    }
  }

  if (ids.size() == 0) {
    Serial.println("No attendance recorded. Discarding batch.");
    return; // Goes back to main loop without hitting the API
  }

  // ── Submit ──
  submitAttendance(attDoc);
}


// ============================================================
//  Submit attendance JSON to server
// ============================================================
void submitAttendance(DynamicJsonDocument& attDoc) {
  String payload;
  serializeJson(attDoc, payload);
  Serial.println("Submitting: " + payload);

  HTTPClient http;
  http.begin(BASE_URL + "api/submit-attendance/" + module_id + "/");
  Serial.println(BASE_URL + "api/submit-attendance/" + module_id + "/");
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(payload);

  Serial.print("Response code: "); Serial.println(code);

  if (code == 200 || code == 201) {
    String resp = http.getString();
    DynamicJsonDocument respDoc(512);
    deserializeJson(respDoc, resp);
    String status = respDoc["status"].as<String>();
    if (status == "success") {
      Serial.println("Attendance submitted successfully!");
    } else {
      Serial.print("Server error: ");
      Serial.println(respDoc["message"].as<String>());
    }
  } else {
    Serial.println("HTTP error — attendance NOT submitted.");
  }
  http.end();
}


// ============================================================
//  RFID HELPER: Convert byte array UID to String
// ============================================================
String getUIDString() {
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) {
      uid += "0";
    }
    uid += String(mfrc522.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}


// ============================================================
//  Fetch Connection & Module config from server, save to SPIFFS
// ============================================================
void fetchAndSaveConfig() {
  Serial.println("Fetching Connection & Module config from server...");
  HTTPClient http;
  http.begin(BASE_URL + "api/wifi/"+module_id+"/");
  Serial.println(BASE_URL + "api/wifi/"+module_id+"/"); 
  int code = http.GET();
  Serial.print("Config fetch response: "); Serial.println(code);

  if (code == 200) {
    String body = http.getString();
    Serial.println("Received: " + body);
    saveFile("/Connection_and_module.json", body.c_str());
    Serial.println("Connection & Module config saved.");
  } else {
    Serial.println("Config fetch failed — using cached file.");
  }
  http.end();
}


// ============================================================
//  HELPERS
// ============================================================
void saveFile(const char* path, const char* data) {
  File f = SPIFFS.open(path, "w");
  if (!f) { Serial.println("File open failed."); return; }
  f.print(data);
  f.close();
  Serial.println("Saved.");
}

void printFile(const char* path) {
  File f = SPIFFS.open(path, "r");
  if (!f) { Serial.println("File not found."); return; }
  while (f.available()) Serial.write(f.read());
  f.close();
  Serial.println();
}