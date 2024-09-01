#pragma once

#include <Arduino.h>
#ifdef ESP32
#include <FreeRTOS.h>
#include <task.h>
#include <queue.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include "SPIFFS.h"
#endif

#include "LSM6DSO.h"
#include "SSD1306Display.h"

// グループ化するサンプル数 (* 10ms = 計測震度の計算間隔)
#define INTENSITY_PROCESS_SAMPLE_GROUP_SIZE 20

#include "IntensityProcessor.h"

// main.cpp のシリアルコマンドで使用する ADC ステップあたりの gal
#define SEISMOMETER_ADC_STEP (lsm6dso.getSensitivity())

void printNmea(const char *format, ...);
void printErrorNmea(const char *id);
void serialCommandTask(void *pvParameters);

IntensityProcessor *processor;
QueueHandle_t displayIntensityQueue;
QueueHandle_t webSocketSensorDataQueue;
QueueHandle_t webSocketIntensityQueue;

auto lsm6dso = LSM6DSO();
void measureTask(void *pvParameters) {
    auto xLastWakeTime = xTaskGetTickCount();
    int16_t offsetRawData[3];
    int16_t rawData[3];
    float sample[3];
    lsm6dso.begin();

    lsm6dso.read(offsetRawData);
    while (1) {
        lsm6dso.read(rawData);
        printNmea("XSRAW,%d,%d,%d", rawData[0], rawData[1], rawData[2]);

        for (auto i = 0; i < 3; i++)
            sample[i] = ((float)offsetRawData[i] - rawData[i]) * lsm6dso.getSensitivity();

        processor->process(sample);

        // 100Hz で動かす
        if (!xTaskDelayUntil(&xLastWakeTime, configTICK_RATE_HZ / 100)) {
            printErrorNmea("MEASURE_DROPPED");
        }
    }
}

float rawInt = NAN;


auto display = SSD1306Display();
void oledDisplayTask(void *pvParameters) {
    auto xLastWakeTime = xTaskGetTickCount();

    JmaIntensity maxIntensity = JMA_INT_0;
    ulong maxIntensityAt = millis();

    display.begin();
    display.wakeup();
    vTaskDelay(configTICK_RATE_HZ * 3);

    while (1) {
        // 100Hz で動かす
        xTaskDelayUntil(&xLastWakeTime, configTICK_RATE_HZ / 100);

        // キューから値を取り出す
        if (xQueueReceive(displayIntensityQueue, &rawInt, 0) == pdFALSE && rawInt == NAN)
            continue;

        if (!processor->getIsStable()) {
            display.stabilityAnimate(rawInt, processor->calcStdDev());
            continue;
        }

        auto latestIntensity = getJmaIntensity(rawInt);
        if (millis() - maxIntensityAt > 60 * 10 * 1000 || maxIntensity <= latestIntensity) {
            maxIntensity = latestIntensity;
            maxIntensityAt = millis();
        }

        // 常時表示をすると OLED の寿命が溶けるので動きがない場合は消灯させる
        display.displayIntensity(latestIntensity, rawInt, processor->calcStdDev() <= 0.05, maxIntensity);
    }
}

void wifiTask(void *pvParameters) {
    const char *ssid = "SSID-BF54B7";
    const char *password = "xbH7cr3m";
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());

    while (1) {
        delay(1000);
    }
}

void httpTask(void *pvParameters) {
    auto xLastWakeTime = xTaskGetTickCount();
    SPIFFS.begin();

    DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
    DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "*");
    AsyncWebServer server(80);
    AsyncWebSocket ws("/ws");

    server.addHandler(&ws);

    server.on("/hwinfo", HTTP_GET, [](AsyncWebServerRequest *request) {
        char buffer[128];
        sprintf(buffer, "XSHWI,1,%s,%s,%s,%s,%f", APP_NAME, APP_VERSION, SEISMOMETER_DEVICE_NAME, SEISMOMETER_SENSOR_NAME, SEISMOMETER_ADC_NAME, SEISMOMETER_ADC_STEP);
        request->send(200, "text/plain", buffer);
    });

    server.serveStatic("/", SPIFFS, "/www/").setDefaultFile("index.html");

    server.begin();

    while (1) {
        // 100Hz で動かす
        xTaskDelayUntil(&xLastWakeTime, configTICK_RATE_HZ / 100);

        ws.cleanupClients();
        JsonDocument doc;
        if (!processor->getIsStable())
            doc["STABLE"] = false;
        else
            doc["STABLE"] = true;

        // キューから値を取り出す
        float rawIntensity;
        if (xQueueReceive(webSocketIntensityQueue, &rawIntensity, 0) == pdFALSE && rawIntensity == NAN)
            continue;
        else
            doc["INT"] = rawIntensity;

        float acc[3];
        if (xQueueReceive(webSocketSensorDataQueue, &acc, 0) == pdFALSE && acc[0] == NAN){
            continue;
        } else {
            doc["ACC"]["X"] = acc[0];
            doc["ACC"]["Y"] = acc[1];
            doc["ACC"]["Z"] = acc[2];
        }

        char buffer[128];
        serializeJson(doc, buffer);

        ws.textAll(buffer);
	}
}


void setup() {
    Serial.begin(115200);

    displayIntensityQueue = xQueueCreate(1, sizeof(float));
    // (float x, float y, float z)
    webSocketSensorDataQueue = xQueueCreate(1, sizeof(float) * 3);
    webSocketIntensityQueue = xQueueCreate(1, sizeof(float));
    processor = new IntensityProcessor([](float sample[3]) {
        printNmea("XSACC,%.3f,%.3f,%.3f", sample[0], sample[1], sample[2]);
        xQueueOverwrite(webSocketSensorDataQueue, sample);
    }, [](float rawInt) {
        printNmea("XSINT,%.3f,%.2f", -1.0, processor->getIsStable() ? rawInt : NAN);
        xQueueOverwrite(displayIntensityQueue, &rawInt);
        xQueueOverwrite(webSocketIntensityQueue, &rawInt);
    });

#ifdef ESP32
    xTaskCreatePinnedToCore(measureTask, "Measure", 4096, NULL, 10, NULL, 0x01);
    xTaskCreatePinnedToCore(oledDisplayTask, "OLEDDisplay", 4096, NULL, 5, NULL, 0x01);
    xTaskCreatePinnedToCore(serialCommandTask, "Serial", 4096, NULL, 5, NULL, 0x01);
    xTaskCreatePinnedToCore(wifiTask, "Wifi", 4096, NULL, 5, NULL, 0x00);
    xTaskCreatePinnedToCore(httpTask, "Http", 4096, NULL, 5, NULL, 0x00);
#else
    xTaskCreateAffinitySet(measureTask, "Measure", 4096, NULL, 10, 0x01, NULL);
    xTaskCreateAffinitySet(oledDisplayTask, "OLEDDisplay", 2048, NULL, 5, 0x01, NULL);
    xTaskCreateAffinitySet(serialCommandTask, "Serial", 4096, NULL, 5, 0x01, NULL);
#endif


    vTaskDelete(NULL);  /* delete loopTask. */
}

void loop() {
}
