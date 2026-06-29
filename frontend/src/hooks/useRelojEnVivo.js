// ============================================================
// Hook: useRelojEnVivo
// ============================================================
// Devuelve la fecha/hora actual, actualizándose cada segundo.
// Se usa para el reloj grande del dashboard.
// ============================================================

import { useEffect, useState } from 'react';

export function useRelojEnVivo() {
  const [ahora, setAhora] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  return ahora;
}
