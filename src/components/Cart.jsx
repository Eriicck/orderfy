import { useState } from "react";

export default function Cart({ items, onAdd, onRemove, tenant }) {
  const [isOpen, setIsOpen] = useState(false);
  const color = tenant.colorPrimario || "#f59e0b";
  const total = items.reduce((a, i) => a + i.precio * i.qty, 0);
  const count = items.reduce((a, i) => a + i.qty, 0);

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      {count > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position:"fixed", bottom:"24px", right:"24px",
            background: color, border:"none", borderRadius:"99px",
            padding:"14px 20px", cursor:"pointer",
            display:"flex", alignItems:"center", gap:"10px",
            boxShadow:"0 4px 20px rgba(0,0,0,0.4)", zIndex:100
          }}
        >
          <span style={{ fontWeight:"800", fontSize:"15px", color:"#000" }}>
            🛒 {count} — ${total.toLocaleString('es-AR')}
          </span>
        </button>
      )}

      {/* DRAWER */}
      {isOpen && (
        <div style={{
          position:"fixed", inset:0, zIndex:200,
          background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end"
        }} onClick={() => setIsOpen(false)}>
          <div
            style={{
              background:"#1e1e1e", width:"100%", maxWidth:"500px",
              margin:"0 auto", borderRadius:"20px 20px 0 0", padding:"20px",
              maxHeight:"80vh", overflowY:"auto"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ color:"#f0f0f0", marginBottom:"16px" }}>Tu pedido</h2>

            {items.map(item => (
              <div key={item.id} style={{
                display:"flex", justifyContent:"space-between",
                alignItems:"center", padding:"10px 0",
                borderBottom:"1px solid #2a2a2a"
              }}>
                <div style={{ color:"#f0f0f0" }}>
                  <div style={{ fontWeight:"600" }}>{item.nombre}</div>
                  <div style={{ fontSize:"13px", color:"#888" }}>${item.precio.toLocaleString('es-AR')} c/u</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <button onClick={() => onRemove(item.id)} style={{ background:"#333", border:"none", color:"#fff", borderRadius:"50%", width:"28px", height:"28px", cursor:"pointer", fontSize:"16px" }}>−</button>
                  <span style={{ color:"#f0f0f0", fontWeight:"700", minWidth:"16px", textAlign:"center" }}>{item.qty}</span>
                  <button onClick={() => onAdd(item)} style={{ background: color, border:"none", color:"#000", borderRadius:"50%", width:"28px", height:"28px", cursor:"pointer", fontSize:"16px", fontWeight:"800" }}>+</button>
                </div>
              </div>
            ))}

            <div style={{ marginTop:"16px", padding:"12px 0", borderTop:"2px solid #333", display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:"#f0f0f0", fontWeight:"700" }}>Total</span>
              <span style={{ color, fontWeight:"800", fontSize:"18px" }}>${total.toLocaleString('es-AR')}</span>
            </div>

<button
  onClick={() => {
    const lineas = items.map(i => `• ${i.nombre} x${i.qty} — $${(i.precio * i.qty).toLocaleString('es-AR')}`).join('\n');
    const texto = `Hola! Quiero hacer un pedido 🛒\n\n${lineas}\n\n*Total: $${total.toLocaleString('es-AR')}*`;
    window.open(`https://wa.me/${tenant.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank');
  }}
  style={{
    width:"100%", padding:"14px", marginTop:"12px",
    background: color, border:"none", borderRadius:"12px",
    fontWeight:"800", fontSize:"16px", cursor:"pointer", color:"#000"
  }}
>
  Confirmar pedido 🚀
</button>
          </div>
        </div>
      )}
    </>
  );
}