import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDztJtLIkYSGCBto4tppZKQnD-TL5LLgAA",
  authDomain: "orderfy-saas.firebaseapp.com",
  projectId: "orderfy-saas",
  storageBucket: "orderfy-saas.firebasestorage.app",
  messagingSenderId: "622673194155",
  appId: "1:622673194155:web:6ea7437b1397d43e45dbee"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TENANT_ID = "demo-hamburgueseria";

const products = [
  // HAMBURGUESAS
  { nombre:"Clásica", descripcion:"Carne, lechuga, tomate, cheddar", precio:4500, categoriaId:"hamburguesas", disponible:true, imagen:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
  { nombre:"Doble Carne", descripcion:"Doble medallón, bacon, cheddar doble", precio:6500, categoriaId:"hamburguesas", disponible:true, imagen:"https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400" },
  { nombre:"BBQ Bacon", descripcion:"Carne, bacon crocante, salsa BBQ", precio:7500, categoriaId:"hamburguesas", disponible:true, imagen:"https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400" },
  { nombre:"Veggie", descripcion:"Medallón vegetal, rúcula, tomate", precio:5500, categoriaId:"hamburguesas", disponible:true, imagen:"https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400" },
  // COMBOS
  { nombre:"Combo Clásica", descripcion:"Clásica + papas + bebida", precio:8500, categoriaId:"combos", disponible:true, imagen:"https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400" },
  { nombre:"Combo Doble", descripcion:"Doble Carne + papas + bebida", precio:11500, categoriaId:"combos", disponible:true, imagen:"https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400" },
  // BEBIDAS
  { nombre:"Coca-Cola", descripcion:"Lata 354ml", precio:1800, categoriaId:"bebidas", disponible:true, imagen:"https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400" },
  { nombre:"Agua Mineral", descripcion:"500ml con o sin gas", precio:1200, categoriaId:"bebidas", disponible:true, imagen:"https://images.unsplash.com/photo-1559839734-2b71ea197ec6?w=400" },
  { nombre:"Jugo Natural", descripcion:"Naranja o manzana", precio:2200, categoriaId:"bebidas", disponible:true, imagen:"https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400" },
  // POSTRES
  { nombre:"Brownie", descripcion:"Con helado de vainilla", precio:2800, categoriaId:"postres", disponible:true, imagen:"https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400" },
  { nombre:"Cheesecake", descripcion:"Con frutos rojos", precio:3200, categoriaId:"postres", disponible:true, imagen:"https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400" },
];

async function seed() {
  console.log("Cargando productos...");
  for (const product of products) {
    await addDoc(collection(db, "tenants", TENANT_ID, "products"), product);
    console.log("✅", product.nombre);
  }
  console.log("¡Listo! Todos los productos cargados.");
  process.exit(0);
}

seed();