import { useState } from "react";
import { useMenu } from "../hooks/useMenu";

export default function StorePage({ tenant }) {
  const { categories, products, loading } = useMenu(tenant.id);
  const [activeCategory, setActiveCategory] = useState(null);

  const color = tenant.colorPrimario || "#f59e0b";

  if (loading) return <div style={{ padding:"20px", color:"#888" }}>Cargando menú...</div>;

  const activeCat = activeCategory || categories[0]?.id;
  const filteredProducts = products.filter(p => p.categoriaId === activeCat && p.disponible !== false);

  return (
    <div style={{ minHeight:"100vh", background:"#1a1a1a", fontFamily:"sans-serif", color:"#f0f0f0" }}>

      {/* HEADER */}
      <header style={{ background: color, padding:"20px 16px", textAlign:"center" }}>
        <h1 style={{ color:"#000", fontSize:"26px", fontWeight:"800", margin:0 }}>{tenant.nombre}</h1>
      </header>

      {/* CATEGORÍAS */}
      <div style={{ display:"flex", gap:"8px", padding:"12px 16px", overflowX:"auto" }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding:"8px 16px",
              borderRadius:"99px",
              border: activeCat === cat.id ? "none" : "1px solid #444",
              background: activeCat === cat.id ? color : "transparent",
              color: activeCat === cat.id ? "#000" : "#f0f0f0",
              fontWeight:"700",
              fontSize:"13px",
              cursor:"pointer",
              whiteSpace:"nowrap"
            }}
          >
            {cat.nombre || cat.label}
          </button>
        ))}
      </div>

      {/* PRODUCTOS */}
      <div style={{ padding:"8px 16px", maxWidth:"600px", margin:"0 auto" }}>
        {filteredProducts.length === 0
          ? <p style={{ color:"#888" }}>No hay productos en esta categoría.</p>
          : filteredProducts.map(p => (
            <div key={p.id} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"14px 0", borderBottom:"1px solid #2a2a2a"
            }}>
              <div>
                <div style={{ fontWeight:"600", fontSize:"15px" }}>{p.nombre}</div>
                {p.descripcion && <div style={{ fontSize:"12px", color:"#888", marginTop:"2px" }}>{p.descripcion}</div>}
              </div>
              <div style={{ fontWeight:"800", fontSize:"16px", color, marginLeft:"12px", whiteSpace:"nowrap" }}>
                ${p.precio?.toLocaleString('es-AR')}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}