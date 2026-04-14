import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';

// --- ICONOS ---
const Icon = {
  Dashboard: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  Burger: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.1 2.2a2 2 0 0 0-1.8 1.1L7 9h10l-2.3-5.7a2 2 0 0 0-1.8-1.1h-1.8z"/><path d="m3 11 1.7 6.9a2 2 0 0 0 2 1.5h10.6a2 2 0 0 0 2-1.5L21 11H3z"/></svg>,
  Tag: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/></svg>,
  Megaphone: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Logout: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  ChevronUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.44 0 .87-.03 1.28-.09"/><line x1="2" x2="22" y1="2" y2="22"/></svg>,
  Filter: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Image: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
  Layers: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>,
  AlertCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>,
  ExternalLink: () => <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
};

// Íconos de categoría con emojis gastronómicos
const CATEGORY_ICONS = [
  { key: 'burger',    label: 'Hamburguesa',  emoji: '🍔' },
  { key: 'empanada',  label: 'Empanada',     emoji: '🥟' },
  { key: 'hotdog',    label: 'Pancho',       emoji: '🌭' },
  { key: 'tequeno',   label: 'Tequeño',      emoji: '🧀' },
  { key: 'drink',     label: 'Bebida',       emoji: '🥤' },
  { key: 'dessert',   label: 'Postre',       emoji: '🍰' },
  { key: 'pizza',     label: 'Pizza',        emoji: '🍕' },
  { key: 'salad',     label: 'Ensalada',     emoji: '🥗' },
  { key: 'special',   label: 'Especial',     emoji: '⭐' },
  { key: 'spicy',     label: 'Picante',      emoji: '🌶️' },
  { key: 'combo',     label: 'Combo',        emoji: '🎁' },
  { key: 'snack',     label: 'Snack',        emoji: '🍟' },
];

export default function AdminPanel({ tenant, onExit }) {
  const TID = tenant.id;

  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [marqueeText, setMarqueeText] = useState("Cargando banner...");
  const [deliveryCost, setDeliveryCost] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Sidebar
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal Producto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Categoría
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [catImageFile, setCatImageFile] = useState(null);
  const [isSavingCat, setIsSavingCat] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);

  // Config
  const [configForm, setConfigForm] = useState({ nombre:'', whatsapp:'', colorPrimario:'#f59e0b' });
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [tenantData, setTenantData] = useState({});
  const nombre = tenantData.nombre || tenant.nombre || '';
  const initial = nombre[0]?.toUpperCase() || 'A';

  // --- CARGAR DATOS FIREBASE ---
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "tenants", TID, "products"), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoadingData(false);
    });

    const unsubCategories = onSnapshot(collection(db, "tenants", TID, "categories"), (snap) => {
      const cats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCategories(cats.sort((a, b) => (a.orden ?? a.order ?? 99) - (b.orden ?? b.order ?? 99)));
    });

    const unsubTenant = onSnapshot(doc(db, "tenants", TID), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setTenantData(d);
        setMarqueeText(d.banner || '');
        setDeliveryCost(d.deliveryCosto ?? '');
        setConfigForm({ nombre: d.nombre||'', whatsapp: d.whatsapp||'', colorPrimario: d.colorPrimario||'#f59e0b' });
      }
    });

    return () => { unsubProducts(); unsubCategories(); unsubTenant(); };
  }, [TID]);

  // --- PRODUCTOS ---
  const handleEditProduct = (product) => { setCurrentProduct(product); setFileToUpload(null); setIsProductModalOpen(true); };
  const handleCreateProduct = () => { setCurrentProduct({ nombre: '', precio: '', categoriaId: categories[0]?.id || '', descripcion: '', imagen: '' }); setFileToUpload(null); setIsProductModalOpen(true); };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('¿Eliminar este producto permanentemente?')) {
      try { await deleteDoc(doc(db, "tenants", TID, "products", id)); } catch (e) { alert("Error: " + e.message); }
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let imageUrl = currentProduct.imagen;
      if (fileToUpload) {
        const fileRef = ref(storage, `tenants/${TID}/products/${Date.now()}_${fileToUpload.name}`);
        await uploadBytes(fileRef, fileToUpload);
        imageUrl = await getDownloadURL(fileRef);
      }
      const productData = { ...currentProduct, precio: Number(currentProduct.precio), imagen: imageUrl };
      if (currentProduct.id) {
        await updateDoc(doc(db, "tenants", TID, "products", currentProduct.id), productData);
      } else {
        await addDoc(collection(db, "tenants", TID, "products"), productData);
      }
      setIsProductModalOpen(false);
    } catch (e) { alert("Error al guardar: " + e.message); }
    finally { setIsSaving(false); }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
      setCurrentProduct({ ...currentProduct, imagen: URL.createObjectURL(e.target.files[0]) });
    }
  };

  // --- CATEGORÍAS ---
  const handleCreateCategory = () => {
    setCurrentCategory({ label: '', icon: 'burger', image: '' });
    setCatImageFile(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (cat) => {
    setCurrentCategory({ ...cat });
    setCatImageFile(null);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (cat) => {
    const productsInCat = products.filter(p => p.categoriaId === cat.id);
    if (productsInCat.length > 0) {
      setCatToDelete({ ...cat, count: productsInCat.length });
      return;
    }
    if (window.confirm(`¿Eliminar la categoría "${cat.label}"?`)) {
      try { await deleteDoc(doc(db, "tenants", TID, "categories", cat.id)); } catch (e) { alert("Error: " + e.message); }
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!currentCategory.label.trim()) return;
    setIsSavingCat(true);
    try {
      let imageUrl = currentCategory.image || '';
      if (catImageFile) {
        const fileRef = ref(storage, `tenants/${TID}/categories/${Date.now()}_${catImageFile.name}`);
        await uploadBytes(fileRef, catImageFile);
        imageUrl = await getDownloadURL(fileRef);
      }
      const catData = { label: currentCategory.label.trim(), nombre: currentCategory.label.trim(), icon: currentCategory.icon || 'other', image: imageUrl, imagen: imageUrl };
      if (currentCategory.id) {
        await updateDoc(doc(db, "tenants", TID, "categories", currentCategory.id), catData);
      } else {
        await addDoc(collection(db, "tenants", TID, "categories"), { ...catData, activa: true, orden: categories.length });
      }
      setIsCategoryModalOpen(false);
    } catch (e) { alert("Error al guardar categoría: " + e.message); }
    finally { setIsSavingCat(false); }
  };

  // --- BANNER ---
  const handleSaveBanner = async () => {
    try {
      await updateDoc(doc(db, "tenants", TID), { banner: marqueeText });
      alert("¡Cinta actualizada!");
    } catch (e) { alert("Error: " + e.message); }
  };

  const handleSaveDeliveryCost = async () => {
    const cost = Number(deliveryCost);
    if (isNaN(cost) || cost < 0) { alert("Ingresá un monto válido."); return; }
    try {
      await updateDoc(doc(db, "tenants", TID), { deliveryCosto: cost });
      alert("¡Costo de delivery actualizado!");
    } catch (e) { alert("Error: " + e.message); }
  };

  // --- CONFIG ---
  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      await updateDoc(doc(db, "tenants", TID), configForm);
      alert("¡Configuración guardada!");
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsSavingConfig(false); }
  };

  // --- LOGOUT ---
  const handleLogout = async () => {
    if (window.confirm("¿Cerrar sesión?")) {
      await signOut(auth);
      onExit();
    }
  };


  // Toggle switch helper
  const Switch = ({ active, onChange, colorOn = 'bg-red-400', label }) => (
    <div className="flex flex-col items-center gap-1">
      <button type="button" onClick={onChange}
        className={"relative inline-flex h-5 w-10 items-center rounded-full transition-colors " + (active ? colorOn : 'bg-stone-200')}>
        <span className={"inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform " + (active ? 'translate-x-5' : 'translate-x-1')} />
      </button>
      <span className="text-[9px] font-bold text-stone-400 uppercase leading-none">{label}</span>
    </div>
  );

  // Toggle field in Firebase
  const toggleField = async (col, id, field, currentVal) => {
    try { await updateDoc(doc(db, "tenants", TID, col, id), { [field]: !currentVal }); }
    catch (e) { alert("Error: " + e.message); }
  };

  // --- REORDENAR CATEGORÍAS ---
  const handleMoveCategory = async (index, direction) => {
    const sorted = [...categories];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sorted.length) return;
    const updates = [];
    updates.push(updateDoc(doc(db, "tenants", TID, "categories", sorted[index].id), { orden: newIndex }));
    updates.push(updateDoc(doc(db, "tenants", TID, "categories", sorted[newIndex].id), { orden: index }));
    try { await Promise.all(updates); } catch (e) { alert("Error: " + e.message); }
  };

  // --- FILTROS Y PAGINACIÓN ---
  const filteredProducts = products.filter(p => {
    const matchSearch = (p.nombre||'').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategoryFilter === 'all' || p.categoriaId === selectedCategoryFilter;
    return matchSearch && matchCat;
  });
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getCategoryLabel = (catId) => categories.find(c => c.id === catId)?.label || catId;
  const getCategoryIcon = (iconKey) => {
    const found = CATEGORY_ICONS.find(i => i.key === iconKey);
    return found ? <span style={{fontSize: '16px', lineHeight: 1}}>{found.emoji}</span> : <Icon.Tag />;
  };

  // --- SIDEBAR ITEM ---
  const SidebarItem = ({ id, label, icon: IconComp }) => (
    <button
      onClick={(e) => { e.stopPropagation(); setActiveTab(id); setIsMobileSidebarOpen(false); }}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap overflow-hidden z-20 relative
        ${activeTab === id ? 'bg-amber-600 text-white shadow-lg' : 'text-stone-400 hover:bg-stone-800 hover:text-white'}`}
    >
      <div className="min-w-[20px]"><IconComp /></div>
      <span className={`transition-opacity duration-300 ${isSidebarExpanded || isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-stone-50 font-sans text-stone-900 overflow-hidden relative">

      {/* SIDEBAR */}
      <aside
        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        className={`fixed md:relative inset-y-0 left-0 z-30 bg-stone-900 flex flex-col p-3 shadow-xl transition-all duration-300 ease-in-out cursor-pointer
          ${isMobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isSidebarExpanded ? 'md:w-64' : 'md:w-20'}`}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="mb-8 px-2 mt-4 flex items-center justify-between md:justify-center">
            {isSidebarExpanded || isMobileSidebarOpen ? (
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight whitespace-nowrap">{nombre.toUpperCase()}<span className="text-amber-500">ADMIN</span></h1>
                <p className="text-stone-500 text-[10px]">pedidodigital.online</p>
              </div>
            ) : (
              <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center font-bold text-stone-900 shadow-lg">{initial}</div>
            )}
            <button onClick={(e) => { e.stopPropagation(); setIsMobileSidebarOpen(false); }} className="md:hidden text-stone-400 hover:text-white"><Icon.X /></button>
          </div>
          <nav className="space-y-2 flex-grow">
            <SidebarItem id="products" label="Productos" icon={Icon.Burger} />
            <SidebarItem id="categories" label="Categorías" icon={Icon.Tag} />
            <SidebarItem id="banner" label="Cinta / Banner" icon={Icon.Megaphone} />
            <SidebarItem id="config" label="Configuración" icon={Icon.Settings} />
          </nav>
          <div className="mt-auto pt-4 border-t border-stone-800 relative z-20">
            <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300">
              <div className="min-w-[20px]"><Icon.Logout /></div>
              <span className={`transition-opacity duration-300 whitespace-nowrap ${isSidebarExpanded || isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {isMobileSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto relative w-full">
        <header className="bg-white border-b border-stone-200 sticky top-0 z-10 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden text-stone-600 hover:text-stone-900"><Icon.Menu /></button>
            <h2 className="text-lg md:text-xl font-bold text-stone-800 capitalize">
              {activeTab === 'products' ? 'Productos' : activeTab === 'categories' ? 'Categorías' : activeTab === 'banner' ? 'Cinta / Banner' : 'Configuración'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noreferrer" className="hidden md:flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 border border-stone-200 hover:border-stone-400 px-3 py-1.5 rounded-lg transition-all">
              <Icon.ExternalLink /> Ver tienda
            </a>
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-stone-900">{nombre}</p>
              <p className="text-xs text-stone-500">Admin</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold border border-amber-200">{initial}</div>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-6xl mx-auto">

          {/* ===== VISTA PRODUCTOS ===== */}
          {activeTab === 'products' && (
            <div className="space-y-6">

              {/* Barra de búsqueda + botón nuevo */}
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-sm text-sm"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  />
                  <div className="absolute left-3 top-3.5 text-stone-400"><Icon.Search /></div>
                </div>
                <button onClick={handleCreateProduct} className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg flex items-center justify-center gap-2 text-sm">
                  <Icon.Plus /> Nuevo producto
                </button>
              </div>

              {/* FILTRO POR CATEGORÍAS */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => { setSelectedCategoryFilter('all'); setCurrentPage(1); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${selectedCategoryFilter === 'all' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-amber-400 hover:text-amber-600'}`}
                >
                  <Icon.Layers /> Todos
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCategoryFilter === 'all' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>{products.length}</span>
                </button>
                {categories.map(cat => {
                  const count = products.filter(p => p.categoriaId === cat.id).length;
                  const isActive = selectedCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategoryFilter(cat.id); setCurrentPage(1); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${isActive ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-white text-stone-600 border-stone-200 hover:border-amber-400 hover:text-amber-600'}`}
                    >
                      <span className="w-4 h-4">{getCategoryIcon(cat.icon)}</span>
                      {cat.label}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* TABLA DE PRODUCTOS */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                {isLoadingData ? (
                  <div className="p-12 text-center text-stone-400 flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    Cargando productos...
                  </div>
                ) : (
                  <>
                    {/* Desktop */}
                    <table className="w-full text-left hidden md:table">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 font-bold">Producto</th>
                          <th className="px-6 py-4 font-bold">Categoría</th>
                          <th className="px-6 py-4 font-bold">Precio</th>
                          <th className="px-6 py-4 font-bold text-center">Sin stock</th>
                          <th className="px-6 py-4 font-bold text-center">Próx.</th>
                          <th className="px-6 py-4 font-bold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {currentProducts.map(product => (
                          <tr key={product.id} className="hover:bg-stone-50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                {product.imagen
                                  ? <img src={product.imagen} alt="" className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                                  : <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400"><Icon.Image /></div>
                                }
                                <div>
                                  <p className="font-bold text-stone-900">{product.nombre}</p>
                                  <p className="text-xs text-stone-500 truncate max-w-[200px]">{product.descripcion}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1.5 w-fit">
                                <span className="w-3.5 h-3.5">{getCategoryIcon(categories.find(c => c.id === product.categoriaId)?.icon)}</span>
                                {getCategoryLabel(product.categoriaId)}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-stone-900">${product.precio?.toLocaleString('es-AR')}</td>
                            <td className="px-6 py-4 text-center">
                              <Switch active={!!product.sinStock} onChange={() => toggleField('products', product.id, 'sinStock', product.sinStock)} colorOn="bg-red-400" label="Sin stock" />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Switch active={!!product.proximamente} onChange={() => toggleField('products', product.id, 'proximamente', product.proximamente)} colorOn="bg-amber-400" label="Próx." />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleEditProduct(product)} className="p-2 bg-stone-50 hover:bg-amber-100 text-stone-500 hover:text-amber-700 rounded-lg transition-colors"><Icon.Edit /></button>
                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-stone-50 hover:bg-red-100 text-stone-500 hover:text-red-600 rounded-lg transition-colors"><Icon.Trash /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile */}
                    <div className="md:hidden divide-y divide-stone-100">
                      {currentProducts.map(product => (
                        <div key={product.id} className="p-4 flex gap-4 items-start">
                          {product.imagen
                            ? <img src={product.imagen} alt="" className="w-16 h-16 rounded-xl object-cover shadow-sm flex-shrink-0" />
                            : <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 flex-shrink-0"><Icon.Image /></div>
                          }
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <h3 className="font-bold text-stone-900 truncate">{product.nombre}</h3>
                              <span className="font-bold text-amber-600 flex-shrink-0">${product.precio?.toLocaleString('es-AR')}</span>
                            </div>
                            <p className="text-xs text-stone-500 line-clamp-1 mb-2">{product.descripcion}</p>
                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <span className="text-[10px] bg-amber-50 px-2 py-1 rounded-full text-amber-700 font-bold border border-amber-100 flex items-center gap-1">
                                {getCategoryIcon(categories.find(c => c.id === product.categoriaId)?.icon)}
                                {getCategoryLabel(product.categoriaId)}
                              </span>
                              <div className="flex gap-2 items-center">
                                <Switch active={!!product.sinStock} onChange={() => toggleField('products', product.id, 'sinStock', product.sinStock)} colorOn="bg-red-400" label="Stock" />
                                <Switch active={!!product.proximamente} onChange={() => toggleField('products', product.id, 'proximamente', product.proximamente)} colorOn="bg-amber-400" label="Próx." />
                                <button onClick={() => handleEditProduct(product)} className="p-2 bg-stone-100 text-stone-600 rounded-lg"><Icon.Edit /></button>
                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Icon.Trash /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {!isLoadingData && currentProducts.length === 0 && (
                  <div className="p-12 text-center text-stone-400">
                    <Icon.Search />
                    <p className="mt-2">No hay productos {selectedCategoryFilter !== 'all' ? 'en esta categoría' : ''}.</p>
                  </div>
                )}
              </div>

              {/* PAGINACIÓN */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-stone-200">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-stone-600 bg-stone-100 rounded-lg disabled:opacity-50 hover:bg-amber-100 transition-colors"><Icon.ChevronLeft /> Anterior</button>
                  <span className="text-sm font-medium text-stone-500">Página <span className="text-stone-900 font-bold">{currentPage}</span> de {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-stone-600 bg-stone-100 rounded-lg disabled:opacity-50 hover:bg-amber-100 transition-colors">Siguiente <Icon.ChevronRight /></button>
                </div>
              )}
            </div>
          )}

          {/* ===== VISTA CATEGORÍAS ===== */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-stone-500 text-sm">{categories.length} categorías registradas</p>
                <button onClick={handleCreateCategory} className="bg-stone-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg flex items-center gap-2 text-sm">
                  <Icon.Plus /> Nueva categoría
                </button>
              </div>

              {/* Alerta si hay categoría con productos */}
              {catToDelete && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                  <div className="text-red-500 mt-0.5"><Icon.AlertCircle /></div>
                  <div className="flex-1">
                    <p className="font-bold text-red-800">No se puede eliminar "{catToDelete.label}"</p>
                    <p className="text-red-600 text-sm mt-1">Tiene {catToDelete.count} producto(s) asignado(s). Reasigná o eliminá esos productos primero.</p>
                  </div>
                  <button onClick={() => setCatToDelete(null)} className="text-red-400 hover:text-red-600"><Icon.X /></button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map(cat => {
                  const productCount = products.filter(p => p.categoriaId === cat.id).length;
                  return (
                    <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden group hover:shadow-md transition-shadow">
                      {/* Imagen */}
                      <div className="relative h-44 overflow-hidden bg-stone-100">
                        {cat.image ? (
                          <img src={cat.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={cat.label} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300">
                            <Icon.Image />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {/* Order arrows */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          <button
                            onClick={() => handleMoveCategory(categories.indexOf(cat), -1)}
                            disabled={categories.indexOf(cat) === 0}
                            className="w-7 h-7 bg-black/50 hover:bg-amber-500 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
                          ><Icon.ChevronUp /></button>
                          <button
                            onClick={() => handleMoveCategory(categories.indexOf(cat), 1)}
                            disabled={categories.indexOf(cat) === categories.length - 1}
                            className="w-7 h-7 bg-black/50 hover:bg-amber-500 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
                          ><Icon.ChevronDown /></button>
                        </div>
                        <div className="absolute top-2 left-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {categories.indexOf(cat) + 1}
                        </div>
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-lg">
                            {getCategoryIcon(cat.icon)}
                          </div>
                          <h3 className="font-extrabold text-white text-lg drop-shadow">{cat.label}</h3>
                        </div>
                      </div>

                      {/* Footer de la card */}
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch active={!!cat.sinStock} onChange={() => toggleField('categories', cat.id, 'sinStock', cat.sinStock)} colorOn="bg-red-400" label="Stock" />
                          <Switch active={!!cat.proximamente} onChange={() => toggleField('categories', cat.id, 'proximamente', cat.proximamente)} colorOn="bg-amber-400" label="Próx." />
                          <span className="text-xs text-stone-400 font-medium"><span className="font-bold text-stone-700">{productCount}</span> prod.</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEditCategory(cat)}
                            title="Editar"
                            className="w-8 h-8 flex items-center justify-center bg-stone-100 hover:bg-amber-100 text-stone-500 hover:text-amber-700 rounded-lg transition-colors"
                          >
                            <Icon.Edit />
                          </button>
                          <button
                            onClick={() => toggleField('categories', cat.id, 'hidden', cat.hidden)}
                            title={cat.hidden ? 'Mostrar categoría' : 'Ocultar categoría'}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${cat.hidden ? 'bg-stone-800 text-white hover:bg-stone-700' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                          >
                            {cat.hidden ? <Icon.EyeOff /> : <Icon.Eye />}
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            title="Eliminar"
                            className="w-8 h-8 flex items-center justify-center bg-stone-100 hover:bg-red-100 text-stone-500 hover:text-red-600 rounded-lg transition-colors"
                          >
                            <Icon.Trash />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== VISTA BANNER ===== */}
{activeTab === 'banner' && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">

              {/* CINTA */}
              <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
                <div className="bg-stone-900 p-6 text-white">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Icon.Megaphone /> Editar Cinta</h3>
                </div>
                <div className="p-6 md:p-8">
                  <label className="block font-bold text-stone-700 mb-2">Texto del Anuncio</label>
                  <textarea rows="4" className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium text-stone-800" value={marqueeText} onChange={(e) => setMarqueeText(e.target.value)} />
                  <div className="mt-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <p className="text-xs font-bold text-amber-800 uppercase mb-2">Previsualización:</p>
                    <div className="overflow-hidden whitespace-nowrap bg-black py-2 px-4 rounded text-white text-xs font-bold">{marqueeText || '(sin texto)'}</div>
                  </div>
                  <button onClick={handleSaveBanner} className="w-full mt-6 bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg flex justify-center items-center gap-2"><Icon.Check /> Guardar Cambios</button>
                </div>
              </div>

              {/* COSTO DE DELIVERY */}
              <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
                <div className="bg-stone-900 p-6 text-white">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm13 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M2 17h1.5"/><path d="M19 17h3"/><path d="M8 17h5.5"/><path d="M16.5 12H8L6 4H3"/><path d="M21 9h-7l-1 3h9l-1 5Z"/></svg>
                    Costo de Delivery
                  </h3>
                  <p className="text-stone-400 text-sm mt-1">Se suma al total cuando el cliente elige envío a domicilio.</p>
                </div>
                <div className="p-6 md:p-8">
                  <label className="block font-bold text-stone-700 mb-2">Precio del envío ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-lg">$</span>
                    <input type="number" min="0" placeholder="Ej: 1500"
                      className="w-full pl-9 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-stone-900 text-lg"
                      value={deliveryCost} onChange={(e) => setDeliveryCost(e.target.value)} />
                  </div>
                  <div className="mt-4 bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center gap-3">
                    <span className="text-2xl">🛵</span>
                    <div>
                      <p className="text-xs font-bold text-amber-800 uppercase mb-0.5">Vista previa en checkout</p>
                      <p className="text-sm text-stone-700 font-medium">
                        Costo de envío: <span className="font-extrabold text-amber-700">${deliveryCost ? Number(deliveryCost).toLocaleString('es-AR') : '0'}</span>
                      </p>
                    </div>
                  </div>
                  <button onClick={handleSaveDeliveryCost} className="w-full mt-6 bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg flex justify-center items-center gap-2">
                    <Icon.Check /> Guardar Costo de Delivery
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== CONFIGURACIÓN ===== */}
          {activeTab === 'config' && (
            
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl h-full">

              {/* DATOS BÁSICOS */}
              <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
                <div className="bg-stone-900 p-6 text-white">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Icon.Settings /> Datos del negocio</h3>
                </div>
                <div className="p-6 md:p-8 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1">Nombre del negocio</label>
                    <input type="text" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                      value={configForm.nombre} onChange={e => setConfigForm(f => ({...f, nombre: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1">WhatsApp (con código de país, sin +)</label>
                    <input type="text" placeholder="Ej: 5491112345678" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                      value={configForm.whatsapp} onChange={e => setConfigForm(f => ({...f, whatsapp: e.target.value}))} />
                    <p className="text-xs text-stone-400 mt-1">Argentina → 5491112345678 · Sin +, sin espacios</p>
                  </div>
                  <button onClick={handleSaveConfig} disabled={isSavingConfig} className="w-full mt-2 bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg flex justify-center items-center gap-2">
                    {isSavingConfig ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Icon.Check /> Guardar</>}
                  </button>
                </div>
              </div>

              {/* COLOR */}
              <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
                <div className="bg-stone-900 p-6 text-white">
                  <h3 className="text-xl font-bold">Color principal</h3>
                  <p className="text-stone-400 text-sm mt-1">Se aplica en botones y elementos destacados de la carta.</p>
                </div>
                <div className="p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <input type="color" value={configForm.colorPrimario} onChange={e => setConfigForm(f => ({...f, colorPrimario: e.target.value}))}
                      className="w-14 h-14 rounded-xl border-2 border-stone-200 cursor-pointer p-1" />
                    <input type="text" className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none font-mono text-sm"
                      value={configForm.colorPrimario} onChange={e => setConfigForm(f => ({...f, colorPrimario: e.target.value}))} />
                    <div className="w-14 h-14 rounded-xl border-2 border-stone-200 flex-shrink-0" style={{ background: configForm.colorPrimario }} />
                  </div>
                  <div className="bg-stone-900 rounded-xl p-4">
                    <p className="text-xs text-stone-500 uppercase font-bold mb-3 tracking-wider">Vista previa</p>
                    <div className="flex gap-3 items-center">
                      <div className="px-4 py-2 rounded-lg font-bold text-stone-900 text-sm" style={{ background: configForm.colorPrimario }}>Botón principal</div>
                      <div className="px-4 py-2 rounded-lg font-bold text-sm border-2" style={{ borderColor: configForm.colorPrimario, color: configForm.colorPrimario }}>Outline</div>
                    </div>
                  </div>
                  <button onClick={handleSaveConfig} disabled={isSavingConfig} className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg flex justify-center items-center gap-2">
                    {isSavingConfig ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Icon.Check /> Guardar color</>}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ===== MODAL PRODUCTO ===== */}
      {isProductModalOpen && currentProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h2 className="text-xl font-bold text-stone-900">{currentProduct.id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setIsProductModalOpen(false)} className="text-stone-400 hover:text-stone-900"><Icon.X /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 md:p-8 overflow-y-auto space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-bold text-stone-700 mb-2">Imagen</label>
                  <div className="aspect-square rounded-2xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center overflow-hidden relative group hover:border-amber-500 transition-colors mb-3">
                    {currentProduct.imagen
                      ? <img src={currentProduct.imagen} className="w-full h-full object-cover" alt="Preview" onError={(e) => { e.target.style.display="none"; }} />
                      : <div className="text-stone-400 text-center p-4"><Icon.Upload /><span className="text-xs block mt-2">Subir archivo</span></div>}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"><span className="text-white text-xs font-bold">Cambiar</span></div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1">O pegá un link de imagen</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      className="w-full p-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                      value={currentProduct.imagen && !fileToUpload ? currentProduct.imagen : ""}
                      onChange={(e) => { setFileToUpload(null); setCurrentProduct({ ...currentProduct, imagen: e.target.value }); }}
                    />
                  </div>
                </div>
                <div className="w-full md:w-2/3 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1">Nombre</label>
                    <input required type="text" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none" value={currentProduct.nombre} onChange={(e) => setCurrentProduct({ ...currentProduct, nombre: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1">Precio ($)</label>
                      <input required type="number" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none" value={currentProduct.precio} onChange={(e) => setCurrentProduct({ ...currentProduct, precio: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1">Categoría</label>
                      <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none" value={currentProduct.categoriaId} onChange={(e) => setCurrentProduct({ ...currentProduct, categoriaId: e.target.value })}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1">Descripción</label>
                    <textarea rows="3" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none" value={currentProduct.descripcion} onChange={(e) => setCurrentProduct({ ...currentProduct, descripcion: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-stone-100 flex gap-4">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-3 font-bold text-stone-500 hover:bg-stone-100 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-lg flex items-center justify-center gap-2">
                  {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL CATEGORÍA ===== */}
      {isCategoryModalOpen && currentCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h2 className="text-xl font-bold text-stone-900">{currentCategory.id ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-stone-400 hover:text-stone-900"><Icon.X /></button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6 space-y-5">

              {/* Nombre */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Nombre de la categoría</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Hamburguesas"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  value={currentCategory.label}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, label: e.target.value })}
                />
              </div>

              {/* Icono */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Ícono representativo</label>
                <div className="grid grid-cols-6 gap-2">
                  {CATEGORY_ICONS.map(ic => (
                    <button
                      key={ic.key}
                      type="button"
                      onClick={() => setCurrentCategory({ ...currentCategory, icon: ic.key })}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${currentCategory.icon === ic.key ? 'border-amber-500 bg-amber-50' : 'border-stone-200 bg-stone-50 hover:border-amber-300'}`}
                      title={ic.label}
                    >
                      <span style={{fontSize: '22px', lineHeight: 1}}>{ic.emoji}</span>
                      <span className="text-[9px] font-bold text-stone-500">{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Imagen de portada</label>
                <div className="relative h-32 rounded-xl bg-stone-100 border-2 border-dashed border-stone-300 overflow-hidden group hover:border-amber-500 transition-colors flex items-center justify-center">
                  {currentCategory.image ? (
                    <img src={currentCategory.image} className="w-full h-full object-cover" alt="preview" />
                  ) : (
                    <div className="text-stone-400 text-center">
                      <Icon.Image />
                      <p className="text-xs mt-1">Subir imagen</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setCatImageFile(e.target.files[0]);
                        setCurrentCategory({ ...currentCategory, image: URL.createObjectURL(e.target.files[0]) });
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-white text-xs font-bold">Cambiar imagen</span>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="O pegá un link de imagen (https://...)"
                  className="w-full text-xs p-2.5 mt-2 bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none text-stone-600 placeholder:text-stone-400"
                  value={catImageFile ? '' : (currentCategory.image || '')}
                  onChange={(e) => { setCatImageFile(null); setCurrentCategory({ ...currentCategory, image: e.target.value }); }}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-3 font-bold text-stone-500 hover:bg-stone-100 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={isSavingCat} className="flex-1 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-lg flex items-center justify-center gap-2">
                  {isSavingCat ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Icon.Check /> Guardar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}