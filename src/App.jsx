import { useTenant } from "./hooks/useTenant";
import StorePage from "./components/StorePage";

export default function App() {
  const { tenant, loading, error } = useTenant();
  if (loading) return <Screen color="#f59e0b" text="Cargando..." />;
  if (error) return <Screen color="#ef4444" text={error} />;
  return <StorePage tenant={tenant} />;
}

function Screen({ color, text }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0c0c0c", color, fontFamily:"sans-serif" }}>
      {text}
    </div>
  );
}