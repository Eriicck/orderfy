import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export function useMenu(tenantId) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    const catRef = collection(db, "tenants", tenantId, "categories");
    const prodRef = collection(db, "tenants", tenantId, "products");

    const unsubCat = onSnapshot(catRef, (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubProd = onSnapshot(prodRef, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => { unsubCat(); unsubProd(); };
  }, [tenantId]);

  return { categories, products, loading };
}