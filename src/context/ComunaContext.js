import { createContext, useContext, useState } from "react";

const ComunaContext = createContext();

export function ComunaProvider({ children }) {
  const [comuna, setComuna] = useState("");
  return (
    <ComunaContext.Provider value={{ comuna, setComuna }}>
      {children}
    </ComunaContext.Provider>
  );
}

export function useComuna() {
  return useContext(ComunaContext);
}