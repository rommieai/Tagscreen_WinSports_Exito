import { createContext, useContext, useState } from "react";

const ResultadoContext = createContext();

export function ResultadoProvider({ children }) {
  const [faces, setFaces] = useState([]);
  const [logo, setLogo] = useState([]);

  const agregarResultado = (data) => {
    const normalizeName = (name) => {
      if (!name || typeof name !== "string") return "";

      return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, "n")
        .replace(/[^a-z0-9]/g, "")
        .trim();
    };

    if (data?.length) {
      const filteredFaces = data
        .filter((item) => item.confidence >= 0.96)
        .map((item) => ({
          confidence: item.confidence,
          name: normalizeName(item.name),
        }));

      if (filteredFaces.length > 0) {
        setFaces(filteredFaces);
      }
    }
  };

  return (
    <ResultadoContext.Provider
      value={{
        faces,
        setFaces,
        agregarResultado,
      }}
    >
      {children}
    </ResultadoContext.Provider>
  );
}

export function useResultado() {
  const context = useContext(ResultadoContext);
  if (!context) {
    throw new Error(
      "useResultado debe ser usado dentro de un ResultadoProvider",
    );
  }
  return context;
}
