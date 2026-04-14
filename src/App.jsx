import { useTenant } from "./hooks/useTenant";

function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0c0c0c",
      color: "#f59e0b",
      fontFamily: "sans-serif",
      fontSize: "18px"
    }}>
      Cargando...
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0c0c0c",
      color: "#ef4444",
      fontFamily: "sans-serif",
      fontSize: "18px"
    }}>
      {message}
    </div>
  );
}

export default function App() {
  const { tenant, loading, error } = useTenant();

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <div>
      <h1 style={{ color: "#f59e0b", fontFamily: "sans-serif" }}>
        ✅ Tenant cargado: {tenant.id}
      </h1>
      <pre style={{ color: "#fff", background: "#1c1c1c", padding: "1rem" }}>
        {JSON.stringify(tenant, null, 2)}
      </pre>
    </div>
  );
}