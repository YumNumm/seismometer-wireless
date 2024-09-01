"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Moon, Sun } from "lucide-react";
import { IntensityDisplay } from "./IntensityDisplay";
import { AccelerationDisplay } from "./AccelerationDisplay";
import { SeismicChart } from "./SeismicChart";
import { useWebSocket } from "../hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export function EarthquakeMonitor() {
  const { chartData, wsStatus } = useWebSocket();
  const { theme, setTheme } = useTheme();

  const seismicData = chartData[chartData.length - 1];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-3xl mx-auto dark:bg-gray-800 dark:text-white font-mono shadow-lg dark:shadow-black/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">EQIS-1 (地震計)</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
            </Button>
            {seismicData && (
              <Badge
                variant={seismicData.isStable ? "default" : "secondary"}
                className={
                  seismicData.isStable ? "bg-green-500" : "bg-yellow-500"
                }
              >
                {seismicData.isStable ? "安定" : "不安定"}
              </Badge>
            )}
            <Badge
              variant={
                wsStatus === "connected"
                  ? "default"
                  : wsStatus === "disconnected"
                  ? "destructive"
                  : "secondary"
              }
              className="ml-2"
            >
              {wsStatus === "connected"
                ? "接続中"
                : wsStatus === "disconnected"
                ? "未接続"
                : "エラー"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {seismicData ? (
            <>
              <IntensityDisplay intensity={seismicData.intensity} />
              <AccelerationDisplay acceleration={seismicData.acceleration} />
              <SeismicChart data={chartData} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                データがありません
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                接続状態を確認してください
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
