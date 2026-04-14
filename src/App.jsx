import { useTenant } from "./hooks/useTenant";
import { useMenu } from "./hooks/useMenu";

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

function StorePage({ tenant }) {
  const { categories, products, loading } = useMenu(tenant.id);

  return (
    <div style={{ minHeight:"100vh", background:"#1a1a1a", fontFamily:"sans-serif" }}>
      <header style={{ background: tenant.colorPrimario || "#f59e0b", padding:"20px", textAlign:"center" }}>
        <h1 style={{ color:"#000", fontSize:"28px", fontWeight:"800", margin:0 }}>{tenant.nombre}</h1>
      </header>
      <main style={{ padding:"20px", maxWidth:"600px", margin:"0 auto" }}>
        {loading ? <p>Cargando menú...</p> : (
          categories.length === 0
            ? <p>No hay categorías aún.</p>
            : categories.map(cat => (
                <div key={cat.id} style={{ marginBottom:"24px" }}>
                  <h2 style={{ fontSize:"18px", fontWeight:"700", borderBottom:"2px solid #444", paddingBottom:"6px", color:"#f0f0f0" }}>
                    {cat.nombre || cat.label}
                  </h2>
                  {products.filter(p => p.categoriaId === cat.id).map(p => (
                    <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #eee" }}>
                      <span style={{ color:"#f0f0f0" }}>{p.nombre}</span>
                      <span style={{ fontWeight:"700" }}>${p.precio?.toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>
              ))
        )}
      </main>
    </div>
  );
}