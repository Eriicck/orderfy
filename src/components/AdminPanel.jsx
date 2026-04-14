import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase";

export default function AdminPanel({ tenant }) {
  const [tab, setTab] = useState("productos");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const color = tenant.colorPrimario || "#f59e0b";

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "tenants", tenant.id, "products"), snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubCat = onSnapshot(collection(db, "tenants", tenant.id, "categories"), snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubProd(); unsubCat(); };
  }, [tenant.id]);

  return (
    <div style={{ minHeight:"100vh", background:"#0c0c0c", fontFamily:"sans-serif", color:"#f0f0f0" }}>
      
      {/* HEADER */}
      <div style={{ background:"#1a1a1a", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #2a2a2a" }}>
        <h1 style={{ fontSize:"18px", fontWeight:"800", color }}>{tenant.nombre} — Admin</h1>
        <button onClick={() => signOut(auth)} style={{ background:"transparent", border:"1px solid #444", color:"#888", padding:"6px 12px", borderRadius:"8px", cursor:"pointer", fontSize:"13px" }}>
          Cerrar sesión
        </button>
      </div>

      {/* TABS */}
      <div style={{ display:"flex", gap:"8px", padding:"16px 20px", borderBottom:"1px solid #2a2a2a" }}>
        {["productos", "categorias"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:"8px 16px", borderRadius:"99px", cursor:"pointer",
            border: tab === t ? "none" : "1px solid #444",
            background: tab === t ? color : "transparent",
            color: tab === t ? "#000" : "#f0f0f0",
            fontWeight:"700", fontSize:"13px", textTransform:"capitalize"
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding:"20px", maxWidth:"700px", margin:"0 auto" }}>
        {tab === "productos" && (
          <ProductsTab products={products} categories={categories} tenantId={tenant.id} color={color} />
        )}
        {tab === "categorias" && (
          <CategoriesTab categories={categories} tenantId={tenant.id} color={color} />
        )}
      </div>
    </div>
  );
}

function ProductsTab({ products, categories, tenantId, color }) {
  const [form, setForm] = useState({ nombre:"", precio:"", categoriaId:"", descripcion:"", disponible:true });
  const [editing, setEditing] = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.nombre || !form.precio || !form.categoriaId) return alert("Completá nombre, precio y categoría.");
    const data = { ...form, precio: Number(form.precio) };
    if (editing) {
      await updateDoc(doc(db, "tenants", tenantId, "products", editing), data);
    } else {
      await addDoc(collection(db, "tenants", tenantId, "products"), data);
    }
    setForm({ nombre:"", precio:"", categoriaId:"", descripcion:"", disponible:true });
    setEditing(null);
  };

  const handleEdit = (p) => {
    setForm({ nombre:p.nombre, precio:p.precio, categoriaId:p.categoriaId, descripcion:p.descripcion||"", disponible:p.disponible });
    setEditing(p.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;
    await deleteDoc(doc(db, "tenants", tenantId, "products", id));
  };

  const inputStyle = { width:"100%", padding:"10px 12px", borderRadius:"10px", border:"1px solid #333", background:"#2a2a2a", color:"#f0f0f0", fontSize:"14px", boxSizing:"border-box", marginBottom:"10px" };

  return (
    <div>
      <h2 style={{ marginBottom:"16px", fontSize:"16px" }}>{editing ? "Editar producto" : "Nuevo producto"}</h2>
      <input style={inputStyle} placeholder="Nombre" value={form.nombre} onChange={e => set("nombre", e.target.value)} />
      <input style={inputStyle} placeholder="Descripción (opcional)" value={form.descripcion} onChange={e => set("descripcion", e.target.value)} />
      <input style={inputStyle} type="number" placeholder="Precio" value={form.precio} onChange={e => set("precio", e.target.value)} />
      <select style={{ ...inputStyle, marginBottom:"10px" }} value={form.categoriaId} onChange={e => set("categoriaId", e.target.value)}>
        <option value="">Seleccionar categoría</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.nombre || c.label}</option>)}
      </select>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
        <input type="checkbox" checked={form.disponible} onChange={e => set("disponible", e.target.checked)} />
        <label style={{ color:"#888", fontSize:"14px" }}>Disponible</label>
      </div>
      <div style={{ display:"flex", gap:"8px", marginBottom:"24px" }}>
        <button onClick={handleSave} style={{ flex:1, padding:"12px", background:color, border:"none", borderRadius:"10px", fontWeight:"800", cursor:"pointer", color:"#000" }}>
          {editing ? "Guardar cambios" : "Agregar producto"}
        </button>
        {editing && (
          <button onClick={() => { setEditing(null); setForm({ nombre:"", precio:"", categoriaId:"", descripcion:"", disponible:true }); }} style={{ padding:"12px 16px", background:"transparent", border:"1px solid #444", borderRadius:"10px", color:"#888", cursor:"pointer" }}>
            Cancelar
          </button>
        )}
      </div>

      <h2 style={{ marginBottom:"12px", fontSize:"16px" }}>Productos ({products.length})</h2>
      {products.map(p => (
        <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px", background:"#1a1a1a", borderRadius:"10px", marginBottom:"8px", border:"1px solid #2a2a2a" }}>
          <div>
            <div style={{ fontWeight:"600" }}>{p.nombre}</div>
            <div style={{ fontSize:"13px", color:"#888" }}>{categories.find(c => c.id === p.categoriaId)?.nombre} — ${p.precio?.toLocaleString('es-AR')}</div>
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={() => handleEdit(p)} style={{ padding:"6px 12px", background:"transparent", border:"1px solid #444", borderRadius:"8px", color:"#f0f0f0", cursor:"pointer", fontSize:"12px" }}>Editar</button>
            <button onClick={() => handleDelete(p.id)} style={{ padding:"6px 12px", background:"transparent", border:"1px solid #ef4444", borderRadius:"8px", color:"#ef4444", cursor:"pointer", fontSize:"12px" }}>Borrar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoriesTab({ categories, tenantId, color }) {
  const [nombre, setNombre] = useState("");
  const [editing, setEditing] = useState(null);

  const handleSave = async () => {
    if (!nombre) return alert("Escribí un nombre.");
    if (editing) {
      await updateDoc(doc(db, "tenants", tenantId, "categories", editing), { nombre });
    } else {
      await addDoc(collection(db, "tenants", tenantId, "categories"), { nombre, activa:true, orden: categories.length + 1 });
    }
    setNombre("");
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar categoría?")) return;
    await deleteDoc(doc(db, "tenants", tenantId, "categories", id));
  };

  return (
    <div>
      <h2 style={{ marginBottom:"16px", fontSize:"16px" }}>{editing ? "Editar categoría" : "Nueva categoría"}</h2>
      <input
        style={{ width:"100%", padding:"10px 12px", borderRadius:"10px", border:"1px solid #333", background:"#2a2a2a", color:"#f0f0f0", fontSize:"14px", boxSizing:"border-box", marginBottom:"10px" }}
        placeholder="Nombre de categoría" value={nombre} onChange={e => setNombre(e.target.value)}
      />
      <div style={{ display:"flex", gap:"8px", marginBottom:"24px" }}>
        <button onClick={handleSave} style={{ flex:1, padding:"12px", background:color, border:"none", borderRadius:"10px", fontWeight:"800", cursor:"pointer", color:"#000" }}>
          {editing ? "Guardar" : "Agregar categoría"}
        </button>
        {editing && <button onClick={() => { setEditing(null); setNombre(""); }} style={{ padding:"12px 16px", background:"transparent", border:"1px solid #444", borderRadius:"10px", color:"#888", cursor:"pointer" }}>Cancelar</button>}
      </div>

      {categories.map(c => (
        <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px", background:"#1a1a1a", borderRadius:"10px", marginBottom:"8px", border:"1px solid #2a2a2a" }}>
          <span style={{ fontWeight:"600" }}>{c.nombre || c.label}</span>
          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={() => { setEditing(c.id); setNombre(c.nombre || c.label); }} style={{ padding:"6px 12px", background:"transparent", border:"1px solid #444", borderRadius:"8px", color:"#f0f0f0", cursor:"pointer", fontSize:"12px" }}>Editar</button>
            <button onClick={() => handleDelete(c.id)} style={{ padding:"6px 12px", background:"transparent", border:"1px solid #ef4444", borderRadius:"8px", color:"#ef4444", cursor:"pointer", fontSize:"12px" }}>Borrar</button>
          </div>
        </div>
      ))}
    </div>
  );
}