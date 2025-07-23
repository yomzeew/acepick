export const findTime = (time: string | number | Date): string => {
    const diff = new Date().getTime() - new Date(time).getTime();
  
    const timeMap: { unit: string; value: number }[] = [
      { unit: "d", value: 24 * 60 * 60 * 1000 },
      { unit: "h", value: 60 * 60 * 1000 },
      { unit: "m", value: 60 * 1000 },
      { unit: "s", value: 1000 },
      { unit: "ms", value: 1 },
    ];
  
    const timeObj = timeMap.find((item) => Math.abs(diff) / item.value >= 1);
  
    if (!timeObj) return "just now";
  
    return timeObj.unit === "ms"
      ? "just now"
      : `${Math.floor(diff / timeObj.value)}${timeObj.unit} ago`;
  };
  