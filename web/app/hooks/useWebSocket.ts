import { useState, useEffect, useCallback } from "react";
import * as v from "valibot";
import { wsMessageSchema } from "@/lib/wsMessage";
import { SeismicData } from "../page";

export function useWebSocket() {
  const [chartData, setChartData] = useState<SeismicData[]>([]);
  const [wsStatus, setWsStatus] = useState<
    "connected" | "disconnected" | "error"
  >("disconnected");

  const addChartData = useCallback((newData: SeismicData) => {
    setChartData((prevData) => {
      const updatedData = [...prevData, newData];
      // 最新の900個のデータポイントのみを保持
      return updatedData.slice(-900);
    });
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;

    const connectWebSocket = () => {
      ws = new WebSocket("ws://192.168.151.1/ws");

      ws.onopen = () => {
        setWsStatus("connected");
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const parsed = v.parse(wsMessageSchema, message);
        const seismic: SeismicData = {
          intensity: parsed.INT ?? 0,
          acceleration: {
            x: parsed.ACC?.X ?? 0,
            y: parsed.ACC?.Y ?? 0,
            z: parsed.ACC?.Z ?? 0,
          },
          timestamp: Date.now(),
          isStable: parsed.STABLE,
        };
        addChartData(seismic);
      };

      ws.onclose = () => {
        setWsStatus("disconnected");
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWsStatus("error");
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [addChartData]);

  return { chartData, wsStatus };
}
