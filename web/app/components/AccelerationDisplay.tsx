interface AccelerationDisplayProps {
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
}

export function AccelerationDisplay({ acceleration }: AccelerationDisplayProps) {
  const formatAcceleration = (value: number) => {
    return value >= 0 ? `+${value.toFixed(3)}` : value.toFixed(3);
  };

  return (
    <div className="mb-4">
      <p className="text-sm font-medium mb-2 dark:text-gray-300">加速度</p>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg">
          <p className="text-xs text-red-700 dark:text-red-300">X</p>
          <p className="text-lg font-semibold text-red-700 dark:text-red-300">
            {formatAcceleration(acceleration.x)}gal
          </p>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
          <p className="text-xs text-purple-700 dark:text-purple-300">Y</p>
          <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">
            {formatAcceleration(acceleration.y)}gal
          </p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">Z</p>
          <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
            {formatAcceleration(acceleration.z)}gal
          </p>
        </div>
      </div>
    </div>
  );
}
