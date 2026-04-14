import { useState } from "react";

export default function Checkout({ items, tenant, onClose }) {
  const color = tenant.colorPrimario || "#f59e0b";
  const total = items.reduce((a, i) => a + i.precio * i.qty, 0);
  const deliveryCosto = tenant.deliveryCosto || 0;

  const [data, setData] = useState({
    tipo: "retiro",
    nombre: "",
    calle: "",
    numero: "",
    pago: "",
    vuelto: ""
  });

  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  const totalFinal = data.tipo === "delivery" ? total + deliveryCosto : total;

  const handleEnviar = () => {
    if (!data.nombre || !data.pago) return alert("Completá nombre y método de pago.");
    if (data.tipo === "delivery" && (!data.calle || !data.numero)) return alert("Completá la dirección.");

    const lineas = items.map(i => `• ${i.nombre} x${i.qty} — $${(i.precio * i.qty).toLocaleString('es-AR')}`).join('\n');
    const entrega = data.tipo === "delivery"
      ? `🛵 Delivery — ${data.calle} ${data.numero}`
      : `🏪 Retiro en local`;
    const pago = data.pago === "efectivo" && data.vuelto
      ? `Efectivo (vuelto de $${data.vuelto})`
      : data.pago;

    const texto = [
      `Hola! Quiero hacer un pedido 🛒`,
      ``,
      lineas,
      ``,
      `📦 ${entrega}`,
      `👤 Nombre: ${data.nombre}`,
      `💳 Pago: ${pago}`,
      ``,
      `*Total: $${totalFinal.toLocaleString('es-AR')}*`
    ].join('\n');

    window.open(`https://wa.me/${tenant.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const inputStyle = {
    width:"100%", padding:"10px 12px", borderRadius:"10px",
    border:"1px solid #333", background:"#2a2a2a", color:"#f0f0f0",
    fontSize:"14px", outline:"none", boxSizing:"border-box"
  };

  const btnTipo = (tipo, label, emoji) => (
    <button onClick={() => set("tipo", tipo)} style={{
      flex:1, padding:"12px", borderRadius:"12px", cursor:"pointer",
      border: data.tipo === tipo ? "none" : "1px solid #444",
      background: data.tipo === tipo ? color : "transparent",
      color: data.tipo === tipo ? "#000" : "#f0f0f0",
      fontWeight:"700", fontSize:"14px"
    }}>
      {emoji} {label}
    </button>
  );

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:300,
      background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"flex-end"
    }} onClick={onClose}>
      <div style={{
        background:"#1e1e1e", width:"100%", maxWidth:"500px",
        margin:"0 auto", borderRadius:"20px 20px 0 0", padding:"20px",
        maxHeight:"90vh", overflowY:"auto"
      }} onClick={e => e.stopPropagation()}>

        <h2 style={{ color:"#f0f0f0", marginBottom:"20px" }}>Finalizar pedido</h2>

        {/* TIPO */}
        <div style={{ display:"flex", gap:"10px", marginBottom:"16px" }}>
          {btnTipo("retiro", "Retiro", "🏪")}
          {btnTipo("delivery", `Delivery +$${deliveryCosto.toLocaleString('es-AR')}`, "🛵")}
        </div>

        {/* NOMBRE */}
        <div style={{ marginBottom:"12px" }}>
          <label style={{ color:"#888", fontSize:"12px" }}>Tu nombre</label>
          <input style={inputStyle} placeholder="Nombre completo" value={data.nombre} onChange={e => set("nombre", e.target.value)} />
        </div>

        {/* DIRECCIÓN */}
        {data.tipo === "delivery" && (
          <div style={{ marginBottom:"12px" }}>
            <label style={{ color:"#888", fontSize:"12px" }}>Dirección</label>
            <div style={{ display:"flex", gap:"8px" }}>
              <input style={{ ...inputStyle, flex:2 }} placeholder="Calle" value={data.calle} onChange={e => set("calle", e.target.value)} />
              <input style={{ ...inputStyle, flex:1 }} placeholder="Altura" value={data.numero} onChange={e => set("numero", e.target.value)} />
            </div>
          </div>
        )}

        {/* PAGO */}
        <div style={{ marginBottom:"12px" }}>
          <label style={{ color:"#888", fontSize:"12px" }}>Método de pago</label>
          <div style={{ display:"flex", gap:"8px" }}>
            {["efectivo", "transferencia", "mercadopago"].map(p => (
              <button key={p} onClick={() => set("pago", p)} style={{
                flex:1, padding:"10px 4px", borderRadius:"10px", cursor:"pointer",
                border: data.pago === p ? "none" : "1px solid #444",
                background: data.pago === p ? color : "transparent",
                color: data.pago === p ? "#000" : "#f0f0f0",
                fontWeight:"600", fontSize:"12px", textTransform:"capitalize"
              }}>{p}</button>
            ))}
          </div>
        </div>

        {/* VUELTO */}
        {data.pago === "efectivo" && data.tipo === "delivery" && (
          <div style={{ marginBottom:"12px" }}>
            <label style={{ color:"#888", fontSize:"12px" }}>¿Con cuánto pagás? (vuelto)</label>
            <input style={inputStyle} type="number" placeholder="Ej: 10000" value={data.vuelto} onChange={e => set("vuelto", e.target.value)} />
          </div>
        )}

        {/* TOTAL */}
        <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 0", borderTop:"1px solid #333", marginTop:"8px" }}>
          <span style={{ color:"#f0f0f0", fontWeight:"700" }}>Total</span>
          <span style={{ color, fontWeight:"800", fontSize:"20px" }}>${totalFinal.toLocaleString('es-AR')}</span>
        </div>

        <button onClick={handleEnviar} style={{
          width:"100%", padding:"14px", background:color,
          border:"none", borderRadius:"12px", fontWeight:"800",
          fontSize:"16px", cursor:"pointer", color:"#000"
        }}>
          Enviar pedido 🚀
        </button>

        <button onClick={onClose} style={{
          width:"100%", padding:"10px", marginTop:"8px",
          background:"transparent", border:"1px solid #333",
          borderRadius:"12px", color:"#888", cursor:"pointer", fontSize:"14px"
        }}>
          ← Volver
        </button>
      </div>
    </div>
  );
}