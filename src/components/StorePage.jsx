import { useState } from "react";
import { useMenu } from "../hooks/useMenu";
import Cart from "./Cart";

export default function StorePage({ tenant }) {
  const { categories, products, loading } = useMenu(tenant.id);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const color = tenant.colorPrimario || "#f59e0b";

  const addToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === productId);
      if (exists?.qty === 1) return prev.filter(i => i.id !== productId);
      return prev.map(i => i.id === productId ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  if (loading) return <div style={{ padding:"20px", color:"#888" }}>Cargando menú...</div>;

  const activeCat = activeCategory || categories[0]?.id;
  const filteredProducts = products.filter(p => p.categoriaId === activeCat && p.disponible !== false);

  return (
    <div style={{ minHeight:"100vh", background:"#1a1a1a", fontFamily:"sans-serif", color:"#f0f0f0" }}>

      <header style={{ background: color, padding:"20px 16px", textAlign:"center" }}>
        <h1 style={{ color:"#000", fontSize:"26px", fontWeight:"800", margin:0 }}>{tenant.nombre}</h1>
      </header>

      <div style={{ display:"flex", gap:"8px", padding:"12px 16px", overflowX:"auto" }}>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
            padding:"8px 16px", borderRadius:"99px",
            border: activeCat === cat.id ? "none" : "1px solid #444",
            background: activeCat === cat.id ? color : "transparent",
            color: activeCat === cat.id ? "#000" : "#f0f0f0",
            fontWeight:"700", fontSize:"13px", cursor:"pointer", whiteSpace:"nowrap"
          }}>
            {cat.nombre || cat.label}
          </button>
        ))}
      </div>

      <div style={{ padding:"8px 16px", maxWidth:"600px", margin:"0 auto" }}>
        {filteredProducts.length === 0
          ? <p style={{ color:"#888" }}>No hay productos en esta categoría.</p>
          : filteredProducts.map(p => {
            const inCart = cartItems.find(i => i.id === p.id);
            return (
<div key={p.id} style={{
  display:"flex", justifyContent:"space-between", alignItems:"center",
  padding:"14px 0", borderBottom:"1px solid #2a2a2a", gap:"12px"
}}>
  <div style={{ flex:1 }}>
    <div style={{ fontWeight:"600", fontSize:"15px" }}>{p.nombre}</div>
    {p.descripcion && <div style={{ fontSize:"12px", color:"#888", marginTop:"2px" }}>{p.descripcion}</div>}
  </div>
  {p.imagen && (
    <img src={p.imagen} style={{ width:"72px", height:"72px", objectFit:"cover", borderRadius:"10px", flexShrink:0 }} />
  )}
                <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                  <span style={{ fontWeight:"800", fontSize:"16px", color }}>${p.precio?.toLocaleString('es-AR')}</span>
                  {inCart ? (
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <button onClick={() => removeFromCart(p.id)} style={{ background:"#333", border:"none", color:"#fff", borderRadius:"50%", width:"28px", height:"28px", cursor:"pointer", fontSize:"16px" }}>−</button>
                      <span style={{ fontWeight:"700", minWidth:"16px", textAlign:"center" }}>{inCart.qty}</span>
                      <button onClick={() => addToCart(p)} style={{ background:color, border:"none", color:"#000", borderRadius:"50%", width:"28px", height:"28px", cursor:"pointer", fontSize:"16px", fontWeight:"800" }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(p)} style={{
                      background: color, border:"none", borderRadius:"99px",
                      padding:"6px 14px", fontWeight:"700", fontSize:"13px",
                      cursor:"pointer", color:"#000"
                    }}>+ Agregar</button>
                  )}
                </div>
              </div>
            );
          })
        }
      </div>

      <Cart items={cartItems} onAdd={addToCart} onRemove={removeFromCart} tenant={tenant} />
    </div>
  );
}