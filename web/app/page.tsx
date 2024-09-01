"use client";

import { EarthquakeMonitor } from "./components/EarthquakeMonitor";

export interface SeismicData {
  intensity: number;
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  timestamp: number;
  isStable: boolean;
}

export default function Component() {
  return (
    <EarthquakeMonitor />
  );
}
