import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useTenant } from "./hooks/useTenant";
import StorePage from "./components/StorePage";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const { tenant, loading, error } = useTenant();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.tenantId === tenant?.id) {
            setUser(u);
            setIsAdmin(true);
            setShowAdmin(true);
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, [tenant]);

  if (loading || authLoading) return <Screen color="#f59e0b" text="Cargando..." />;
  if (error) return <Screen color="#ef4444" text={error} />;

  if (showAdmin) {
    if (!isAdmin) return <AdminLogin onLogin={() => {}} />;
    return <AdminPanel tenant={tenant} />;
  }

  return (
    <>
      <StorePage tenant={tenant} />
      <button
        onClick={() => setShowAdmin(true)}
        style={{
          position:"fixed", bottom:"24px", left:"24px",
          background:"transparent", border:"1px solid #333",
          color:"#444", padding:"6px 12px", borderRadius:"8px",
          cursor:"pointer", fontSize:"11px", zIndex:50
        }}
      >
        Admin
      </button>
    </>
  );
}

function Screen({ color, text }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0c0c0c", color, fontFamily:"sans-serif" }}>
      {text}
    </div>
  );
}