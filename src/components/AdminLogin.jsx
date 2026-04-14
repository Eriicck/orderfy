import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", background:"#0c0c0c", fontFamily:"sans-serif"
    }}>
      <div style={{
        background:"#1a1a1a", borderRadius:"16px",
        padding:"32px", width:"100%", maxWidth:"360px",
        border:"1px solid #2a2a2a"
      }}>
        <h2 style={{ color:"#f0f0f0", marginBottom:"24px", textAlign:"center" }}>Admin Panel</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width:"100%", padding:"10px 12px", borderRadius:"10px", border:"1px solid #333", background:"#2a2a2a", color:"#f0f0f0", fontSize:"14px", marginBottom:"10px", boxSizing:"border-box" }}
          />
          <input
            type="password" placeholder="Contraseña" value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width:"100%", padding:"10px 12px", borderRadius:"10px", border:"1px solid #333", background:"#2a2a2a", color:"#f0f0f0", fontSize:"14px", marginBottom:"16px", boxSizing:"border-box" }}
          />
          {error && <p style={{ color:"#ef4444", fontSize:"13px", marginBottom:"12px" }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            width:"100%", padding:"12px", background:"#f59e0b",
            border:"none", borderRadius:"10px", fontWeight:"800",
            fontSize:"15px", cursor:"pointer", color:"#000"
          }}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}