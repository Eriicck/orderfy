import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export function useTenant() {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTenantId = () => {
      const hostname = window.location.hostname;
      
      // localhost → usamos "demo-hamburgueseria" para testing
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "demo-hamburgueseria";
      }

      // hamburgueseria1.pedidodigital.online → "hamburgueseria1"
      const parts = hostname.split(".");
      if (parts.length >= 3) {
        return parts[0];
      }

      return null;
    };

    const tenantId = getTenantId();

    if (!tenantId) {
      setError("No se encontró el tenant");
      setLoading(false);
      return;
    }

    const fetchTenant = async () => {
      try {
        const ref = doc(db, "tenants", tenantId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setTenant({ id: tenantId, ...snap.data() });
        } else {
          setError("Negocio no encontrado");
        }
      } catch (err) {
        setError("Error al cargar el negocio");
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, []);

  return { tenant, loading, error };
}