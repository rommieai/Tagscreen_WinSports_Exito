import React, { useEffect, useState } from "react";

const DataUsageTracker = () => {
  const [totalBytes, setTotalBytes] = useState(0);

  useEffect(() => {
    let interval;

    const calculateDataUsage = () => {
      const resources = performance.getEntriesByType("resource");

      const total = resources.reduce((acc, resource) => {
        return acc + (resource.transferSize || 0);
      }, 0);

      setTotalBytes(total);
    };

    // Calcular inicialmente
    calculateDataUsage();

    // Actualizar cada segundo
    interval = setInterval(calculateDataUsage, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
  };

  return (
    <div
      style={{
        padding: "10px",
        background: "#111",
        color: "#0f0",
        fontFamily: "monospace",
        borderRadius: "6px",
        width: "fit-content",
      }}
    >
      <strong>Datos consumidos:</strong> {formatBytes(totalBytes)}
    </div>
  );
};

export default DataUsageTracker;
