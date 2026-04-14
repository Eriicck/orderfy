import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useTenant } from "./hooks/useTenant";
import StorePage from "./components/StorePage";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import SuperAdmin from "./components/SuperAdmin";

const SUPER_ADMIN_EMAIL = "contrerasc479@gmail.com";

export default function App() {
  const { tenant, loading, error } = useTenant();
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        if (u.email === SUPER_ADMIN_EMAIL) {
          setUser(u);
          setRol("superadmin");
        } else {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists() && snap.data().tenantId === tenant?.id) {
            setUser(u);
            setRol("admin");
          }
        }
      } else {
        setUser(null);
        setRol(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, [tenant]);

  if (loading || authLoading) return <Screen color="#f59e0b" text="Cargando..." />;
  if (error) return <Screen color="#ef4444" text={error} />;

  return (
    <Routes>
      <Route path="/" element={
        <>
          <StorePage tenant={tenant} />
          <button onClick={() => navigate("/admin")} style={{
            position:"fixed", bottom:"24px", left:"24px",
            background:"transparent", border:"1px solid #333",
            color:"#444", padding:"6px 12px", borderRadius:"8px",
            cursor:"pointer", fontSize:"11px", zIndex:50
          }}>Admin</button>
        </>
      } />
      <Route path="/admin" element={
        rol === "superadmin" ? <SuperAdmin /> :
        rol === "admin" ? <AdminPanel tenant={tenant} onExit={() => navigate("/")} /> :
        <AdminLogin onLogin={() => navigate("/admin")} />
      } />
    </Routes>
  );
}

function Screen({ color, text }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0c0c0c", color, fontFamily:"sans-serif" }}>
      {text}
    </div>
  );
}