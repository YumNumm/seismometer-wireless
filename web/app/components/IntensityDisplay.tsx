interface IntensityDisplayProps {
  intensity: number;
}

export function IntensityDisplay({ intensity }: IntensityDisplayProps) {
  const jmaIntensity = getJMAIntensity(intensity);
  const intensityColorClass = `${intensityColors[jmaIntensity].light} ${intensityColors[jmaIntensity].dark}`;

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="flex flex-col items-center">
        <p className="text-sm font-bold dark:text-gray-300 mb-2">計測震度</p>
        <p className="text-4xl font-bold h-[52px] flex items-center">{intensity.toFixed(1)}</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-sm font-bold dark:text-gray-300 mb-2">震度</p>
        <div className={`inline-flex items-center justify-center text-4xl font-bold px-4 py-2 rounded-lg h-[52px] ${intensityColorClass}`}>
          {jmaIntensity}
        </div>
      </div>
    </div>
  );
}

export enum JmaIntensity {
  Zero = 0,
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4,
  FiveMinus = "5-",
  FivePlus = "5+",
  SixMinus = "6-",
  SixPlus = "6+",
  Seven = 7,
}

export const intensityColors: Record<
  JmaIntensity,
  { light: string; dark: string }
> = {
  [JmaIntensity.Zero]: {
    light: "bg-white text-gray-700",
    dark: "dark:bg-gray-800 dark:text-gray-300",
  },
  [JmaIntensity.One]: {
    light: "bg-blue-100 text-blue-700",
    dark: "dark:bg-blue-900 dark:text-blue-300",
  },
  [JmaIntensity.Two]: {
    light: "bg-blue-300 text-blue-800",
    dark: "dark:bg-blue-700 dark:text-blue-200",
  },
  [JmaIntensity.Three]: {
    light: "bg-green-300 text-green-800",
    dark: "dark:bg-green-700 dark:text-green-200",
  },
  [JmaIntensity.Four]: {
    light: "bg-yellow-300 text-yellow-800",
    dark: "dark:bg-yellow-700 dark:text-yellow-200",
  },
  [JmaIntensity.FiveMinus]: {
    light: "bg-orange-300 text-orange-800",
    dark: "dark:bg-orange-700 dark:text-orange-200",
  },
  [JmaIntensity.FivePlus]: {
    light: "bg-orange-500 text-white",
    dark: "dark:bg-orange-600 dark:text-white",
  },
  [JmaIntensity.SixMinus]: {
    light: "bg-red-500 text-white",
    dark: "dark:bg-red-600 dark:text-white",
  },
  [JmaIntensity.SixPlus]: {
    light: "bg-red-700 text-white",
    dark: "dark:bg-red-800 dark:text-white",
  },
  [JmaIntensity.Seven]: {
    light: "bg-purple-700 text-white",
    dark: "dark:bg-purple-800 dark:text-white",
  },
};

export const getJMAIntensity = (intensity: number): JmaIntensity => {
  if (intensity < 0.5) return JmaIntensity.Zero;
  if (intensity < 1.5) return JmaIntensity.One;
  if (intensity < 2.5) return JmaIntensity.Two;
  if (intensity < 3.5) return JmaIntensity.Three;
  if (intensity < 4.5) return JmaIntensity.Four;
  if (intensity < 5.0) return JmaIntensity.FiveMinus;
  if (intensity < 5.5) return JmaIntensity.FivePlus;
  if (intensity < 6.0) return JmaIntensity.SixMinus;
  if (intensity < 6.5) return JmaIntensity.SixPlus;
  return JmaIntensity.Seven;
};
