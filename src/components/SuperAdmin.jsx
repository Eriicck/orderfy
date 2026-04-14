import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { db, auth } from "../firebase";

const RUBROS = ["Hamburguesería","Pizzería","Sushi","Cafetería","Rotisería","Heladería","Ferretería","Bicicletería","Panadería","Otro"];

export default function SuperAdmin() {
  const [tenants, setTenants] = useState([]);
  const [tab, setTab] = useState("clientes");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre:"", slug:"", rubro:"Hamburguesería", whatsapp:"", email:"", password:"", isDemo:false, activo:true });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tenants"), snap => {
      setTenants(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const filtered = tenants.filter(t => tab === "demos" ? t.isDemo : !t.isDemo);

  const handleCreate = async () => {
    if (!form.nombre || !form.slug || !form.email || !form.password) return alert("Completá todos los campos.");
    setSaving(true);
    try {
      // Crear usuario en Auth
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const uid = cred.user.uid;

      // Crear tenant en Firestore
      await setDoc(doc(db, "tenants", form.slug), {
        nombre: form.nombre,
        rubro: form.rubro,
        whatsapp: form.whatsapp,
        adminEmail: form.email,
        isDemo: form.isDemo,
        activo: form.activo,
        colorPrimario: "#f59e0b",
        deliveryCosto: 1500,
        creadoEn: new Date().toISOString()
      });

      // Crear usuario en /users/
      await setDoc(doc(db, "users", uid), {
        tenantId: form.slug,
        email: form.email,
        rol: "admin"
      });

      setForm({ nombre:"", slug:"", rubro:"Hamburguesería", whatsapp:"", email:"", password:"", isDemo:false, activo:true });
      setShowForm(false);
      alert(`✅ Creado! URL: ${form.slug}.pedidodigital.online`);
    } catch (err) {
      alert("Error: " + err.message);
    }
    setSaving(false);
  };

  const toggleActivo = async (tenant) => {
    await updateDoc(doc(db, "tenants", tenant.id), { activo: !tenant.activo });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este tenant? No se puede deshacer.")) return;
    await deleteDoc(doc(db, "tenants", id));
  };

  const inputStyle = { width:"100%", padding:"10px 12px", borderRadius:"10px", border:"1px solid #333", background:"#2a2a2a", color:"#f0f0f0", fontSize:"14px", boxSizing:"border-box", marginBottom:"10px" };

  return (
    <div style={{ minHeight:"100vh", background:"#0c0c0c", fontFamily:"sans-serif", color:"#f0f0f0" }}>

      {/* HEADER */}
      <div style={{ background:"#1a1a1a", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #2a2a2a" }}>
        <h1 style={{ fontSize:"18px", fontWeight:"800", color:"#f59e0b" }}>⚡ Super Admin — pedidodigital.online</h1>
        <button onClick={() => signOut(auth)} style={{ background:"transparent", border:"1px solid #444", color:"#888", padding:"6px 12px", borderRadius:"8px", cursor:"pointer", fontSize:"13px" }}>
          Salir
        </button>
      </div>

      {/* TABS */}
      <div style={{ display:"flex", gap:"8px", padding:"16px 20px", borderBottom:"1px solid #2a2a2a", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:"8px" }}>
          {["clientes","demos"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:"8px 16px", borderRadius:"99px", cursor:"pointer",
              border: tab === t ? "none" : "1px solid #444",
              background: tab === t ? "#f59e0b" : "transparent",
              color: tab === t ? "#000" : "#f0f0f0",
              fontWeight:"700", fontSize:"13px", textTransform:"capitalize"
            }}>{t} ({tenants.filter(tn => t === "demos" ? tn.isDemo : !tn.isDemo).length})</button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding:"8px 16px", background:"#f59e0b", border:"none",
          borderRadius:"99px", fontWeight:"800", fontSize:"13px", cursor:"pointer", color:"#000"
        }}>
          {showForm ? "Cancelar" : "+ Nuevo"}
        </button>
      </div>

      <div style={{ padding:"20px", maxWidth:"800px", margin:"0 auto" }}>

        {/* FORM */}
        {showForm && (
          <div style={{ background:"#1a1a1a", borderRadius:"14px", padding:"20px", marginBottom:"24px", border:"1px solid #2a2a2a" }}>
            <h2 style={{ marginBottom:"16px", fontSize:"16px", color:"#f59e0b" }}>Nuevo tenant</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
              <input style={inputStyle} placeholder="Nombre del negocio" value={form.nombre} onChange={e => set("nombre", e.target.value)} />
              <input style={inputStyle} placeholder="Slug (subdominio)" value={form.slug} onChange={e => set("slug", e.target.value.toLowerCase().replace(/\s/g,"-"))} />
              <select style={inputStyle} value={form.rubro} onChange={e => set("rubro", e.target.value)}>
                {RUBROS.map(r => <option key={r}>{r}</option>)}
              </select>
              <input style={inputStyle} placeholder="WhatsApp (ej: 5491112345678)" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} />
              <input style={inputStyle} placeholder="Email admin" value={form.email} onChange={e => set("email", e.target.value)} />
              <input style={inputStyle} type="password" placeholder="Contraseña" value={form.password} onChange={e => set("password", e.target.value)} />
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"16px" }}>
              <label style={{ display:"flex", alignItems:"center", gap:"8px", color:"#888", fontSize:"14px", cursor:"pointer" }}>
                <input type="checkbox" checked={form.isDemo} onChange={e => set("isDemo", e.target.checked)} />
                Es demo
              </label>
              <label style={{ display:"flex", alignItems:"center", gap:"8px", color:"#888", fontSize:"14px", cursor:"pointer" }}>
                <input type="checkbox" checked={form.activo} onChange={e => set("activo", e.target.checked)} />
                Activo
              </label>
            </div>
            {form.slug && (
              <p style={{ fontSize:"12px", color:"#888", marginBottom:"12px" }}>
                URL: <span style={{ color:"#f59e0b" }}>{form.slug}.pedidodigital.online</span>
              </p>
            )}
            <button onClick={handleCreate} disabled={saving} style={{ padding:"12px 24px", background:"#f59e0b", border:"none", borderRadius:"10px", fontWeight:"800", cursor:"pointer", color:"#000", fontSize:"15px" }}>
              {saving ? "Creando..." : "Crear tenant"}
            </button>
          </div>
        )}

        {/* LISTA */}
        {filtered.length === 0
          ? <p style={{ color:"#444" }}>No hay {tab} todavía.</p>
          : filtered.map(t => (
            <div key={t.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"#1a1a1a", borderRadius:"12px", marginBottom:"8px", border:`1px solid ${t.activo ? "#2a2a2a" : "#ef444433"}` }}>
              <div>
                <div style={{ fontWeight:"700", fontSize:"15px" }}>{t.nombre}</div>
                <div style={{ fontSize:"12px", color:"#888", marginTop:"2px" }}>
                  {t.rubro} — <span style={{ color:"#f59e0b" }}>{t.id}.pedidodigital.online</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                <span style={{ fontSize:"11px", padding:"3px 8px", borderRadius:"99px", background: t.activo ? "#22c55e22" : "#ef444422", color: t.activo ? "#22c55e" : "#ef4444" }}>
                  {t.activo ? "activo" : "pausado"}
                </span>
                <button onClick={() => toggleActivo(t)} style={{ padding:"6px 10px", background:"transparent", border:"1px solid #444", borderRadius:"8px", color:"#f0f0f0", cursor:"pointer", fontSize:"11px" }}>
                  {t.activo ? "Pausar" : "Activar"}
                </button>
                <button onClick={() => window.open(`https://${t.id}.pedidodigital.online`, '_blank')} style={{ padding:"6px 10px", background:"transparent", border:"1px solid #444", borderRadius:"8px", color:"#f0f0f0", cursor:"pointer", fontSize:"11px" }}>
                  Ver
                </button>
                <button onClick={() => handleDelete(t.id)} style={{ padding:"6px 10px", background:"transparent", border:"1px solid #ef4444", borderRadius:"8px", color:"#ef4444", cursor:"pointer", fontSize:"11px" }}>
                  Borrar
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}