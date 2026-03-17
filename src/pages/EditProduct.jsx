import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";

function EditProduct() {
  const navigate = useNavigate();
  const { productId } = useParams(); 
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  
  // We keep state to trigger re-renders, but will read directly from localStorage in actions
  const [currentShopId, setCurrentShopId] = useState(localStorage.getItem("currentShopId"));

  // Form State
  const [formData, setFormData] = useState({
    itemName: "",
    company: "",
    quantity: "",
    sizes: [{ size: "", price: "" }],
    imageUrl: ""
  });

  useEffect(() => {
    const initData = async () => {
      let shopIdToUse = currentShopId;

      // 1. FETCH SHOP ID IF MISSING
      if (!shopIdToUse) {
        try {
          const token = localStorage.getItem("idToken");
          const shopRes = await fetch("https://1nq17tp97j.execute-api.ap-south-1.amazonaws.com/get-shop", {
            headers: { "Authorization": `Bearer ${token}` }
          });

          if (shopRes.ok) {
            const shopData = await shopRes.json();
            shopIdToUse = shopData.shopId;
            localStorage.setItem("currentShopId", shopIdToUse);
            setCurrentShopId(shopIdToUse);
          } else {
            setError("Failed to verify shop.");
            setLoading(false);
            return;
          }
        } catch (e) {
          setError("Network error fetching shop ID.");
          setLoading(false);
          return;
        }
      }

      // 2. FETCH PRODUCT DETAILS
      if (!productId) {
        setError("Missing Product ID.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("idToken");
        const res = await fetch(
          `https://1nq17tp97j.execute-api.ap-south-1.amazonaws.com/get-products?shopId=${shopIdToUse}`,
          { headers: { "Authorization": `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        
        // FIND PRODUCT: 
        // We try to match the SK first, but also check direct ID fields as a fallback.
        // This helps if the DynamoDB SK format differs slightly.
        const product = data.find(item => 
          item.SK === `PRODUCT#${productId}` || item.productId === productId
        );

        if (product) {
          setFormData({
            itemName: product.itemName || "",
            company: product.company || "",
            quantity: product.quantity || "",
            // Ensure sizes is an array, default if missing
            sizes: Array.isArray(product.sizes) ? product.sizes : [{ size: "", price: "" }],
            imageUrl: product.imageUrl || ""
          });
        } else {
          console.error("Product not found. ID:", productId, "Available SKs:", data.map(i => i.SK));
          setError("Product not found. It may have been deleted or the ID is invalid.");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading product details.");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [productId, currentShopId]);

  // --- HANDLERS ---

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes[index][field] = value;
    setFormData({ ...formData, sizes: updatedSizes });
  };

  const addSizeRow = () => {
    setFormData({ ...formData, sizes: [...formData.sizes, { size: "", price: "" }] });
  };

  const removeSizeRow = (index) => {
    if (formData.sizes.length > 1) {
      const updatedSizes = formData.sizes.filter((_, i) => i !== index);
      setFormData({ ...formData, sizes: updatedSizes });
    }
  };

  // --- DELETE FUNCTION ---
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product? This action cannot be undone.");
    if (!confirmDelete) return;

    setDeleting(true);
    setError("");

    // CRITICAL: Read directly from localStorage to avoid stale state issues
    const shopIdToUse = localStorage.getItem("currentShopId");

    if (!shopIdToUse) {
      setError("Shop ID is missing. Please refresh the page.");
      setDeleting(false);
      return;
    }

    try {
      const token = localStorage.getItem("idToken");
      const res = await fetch("https://1nq17tp97j.execute-api.ap-south-1.amazonaws.com/delete-product", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          shopId: shopIdToUse, // NOTE: Backend should ideally verify this from the Token, not body
          productId: productId
        })
      });

      if (res.ok) {
        alert("Product deleted successfully!");
        navigate("/inventory");
      } else {
        const errData = await res.json().catch(() => ({})); // Safe JSON parse
        setError("Failed to delete: " + (errData.error || errData.message || "Unknown error"));
        setDeleting(false);
      }
    } catch (err) {
      console.error(err);
      setError("Network error while deleting.");
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // CRITICAL: Read directly from localStorage
    const shopIdToUse = localStorage.getItem("currentShopId");

    if (!shopIdToUse) {
        setError("Shop ID is missing. Please refresh the page.");
        setSaving(false);
        return;
    }

    const payload = {
      shopId: shopIdToUse,
      productId: productId,
      itemName: formData.itemName,
      company: formData.company,
      quantity: Number(formData.quantity), 
      sizes: formData.sizes.map(s => ({
        size: s.size,
        price: Number(s.price)
      })),
      imageUrl: formData.imageUrl
    };

    try {
      const token = localStorage.getItem("idToken");
      
      const response = await fetch("https://1nq17tp97j.execute-api.ap-south-1.amazonaws.com/edit-product", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Product updated successfully!");
        navigate("/inventory");
      } else {
        setError(result.error || result.message || "Failed to update product");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{color: 'white', padding: '2rem', textAlign: 'center'}}>Loading product details...</div>;

  return (
    <Layout>
      <div className="edit-product-fullpage">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap');
          .edit-product-fullpage { font-family: 'Inter', sans-serif; height: calc(100vh - 0px); width: 100%; display: flex; overflow: hidden; background: #050505; color: #fff; position: relative; }
          
          .bg-orb { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(191,149,63,0.08) 0%, rgba(0,0,0,0) 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; animation: pulse 8s infinite ease-in-out; pointer-events: none; }
          @keyframes pulse { 0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); } }

          .form-section { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 4rem; z-index: 1; max-width: 800px; }
          
          .glass-card { background: rgba(20, 20, 20, 0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 30px; padding: 3.5rem; box-shadow: 0 25px 50px rgba(0,0,0,0.5); animation: slideUp 0.8s ease-out; border-top: 1px solid rgba(255, 255, 255, 0.2); }
          @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

          .header-row { display: flex; align-items: center; gap: 15px; margin-bottom: 3rem; }
          .header-title { font-size: 2.2rem; font-weight: 700; background: linear-gradient(to right, #fff, #BF953F); -webkit-background-clip: text; background-clip: text; color: transparent; }
          .icon-badge { width: 55px; height: 55px; background: linear-gradient(135deg, #BF953F, #B38728); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #000; box-shadow: 0 10px 25px rgba(191, 149, 63, 0.3); }

          .input-field { position: relative; margin-bottom: 2rem; }
          .modern-input { width: 100%; padding: 20px 20px 20px 20px; font-size: 1.1rem; color: #fff; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; outline: none; transition: all 0.3s ease; }
          .modern-input:focus { background: rgba(255, 255, 255, 0.07); border-color: #BF953F; box-shadow: 0 0 0 6px rgba(191, 149, 63, 0.15); }
          
          .floating-label { position: absolute; left: 20px; top: 20px; color: #666; pointer-events: none; transition: 0.3s ease all; font-size: 1.1rem; }
          .modern-input:focus ~ .floating-label, .modern-input:not(:placeholder-shown) ~ .floating-label { top: -12px; left: 15px; font-size: 0.85rem; color: #BF953F; background: #050505; padding: 0 8px; border-radius: 4px; }

          .sizes-row { display: flex; gap: 15px; margin-bottom: 15px; align-items: center; }
          .size-input { flex: 1; }
          .price-input { flex: 1; }

          .btn-add { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid #444; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-bottom: 2rem; }
          .btn-add:hover { background: rgba(191,149,63,0.2); border-color: #BF953F; }

          .action-buttons { display: flex; gap: 15px; margin-top: 1.5rem; }
          .btn-primary { flex: 2; padding: 18px; font-size: 1.1rem; font-weight: 700; color: #000; background: linear-gradient(135deg, #BF953F, #B38728); border: none; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 25px rgba(191, 149, 63, 0.3); display: flex; justify-content: center; align-items: center; gap: 10px; }
          .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(191, 149, 63, 0.5); }
          
          .btn-danger { flex: 1; padding: 18px; font-size: 1rem; font-weight: 600; color: #fff; background: rgba(231, 76, 60, 0.1); border: 1px solid #e74c3c; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; display: flex; justify-content: center; align-items: center; gap: 8px; }
          .btn-danger:hover { background: #e74c3c; color: white; }
          .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
          
          .visual-section { flex: 1; background: #080808; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
          .grid-bg { position: absolute; width: 200%; height: 200%; background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 50px 50px; transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px); animation: gridMove 20s linear infinite; }
          @keyframes gridMove { 0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); } 100% { transform: perspective(500px) rotateX(60deg) translateY(50px) translateZ(-200px); } }
          .hero-box { width: 60%; max-width: 400px; position: relative; z-index: 10; animation: floatObject 6s ease-in-out infinite; filter: drop-shadow(0 30px 50px rgba(191, 149, 63, 0.15)); }
          @keyframes floatObject { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-25px) rotate(-2deg); } }

          @media (max-width: 1000px) { .edit-product-fullpage { flex-direction: column; height: auto; min-height: 100vh; } .visual-section { display: none; } .form-section { padding: 2rem; width: 100%; max-width: 100%; } .glass-card { padding: 2rem; } }
        `}</style>

        <div className="bg-orb"></div>

        <div className="form-section">
          <div className="glass-card">
            <div className="header-row">
              <div className="icon-badge">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <h2 className="header-title">Edit Product</h2>
            </div>

            {error && <div style={{color: '#ff5555', marginBottom: '1rem', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '8px'}}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-field">
                <input 
                  name="itemName"
                  className="modern-input" 
                  placeholder=" " 
                  value={formData.itemName} 
                  onChange={handleChange}
                  required 
                />
                <label className="floating-label">Product Name</label>
              </div>

              <div className="input-field">
                <input 
                  name="company"
                  className="modern-input" 
                  placeholder=" " 
                  value={formData.company}
                  onChange={handleChange}
                  required 
                />
                <label className="floating-label">Company</label>
              </div>

              <div className="input-field">
                <input 
                  name="quantity"
                  type="number"
                  className="modern-input" 
                  placeholder=" " 
                  value={formData.quantity}
                  onChange={handleChange}
                  required 
                />
                <label className="floating-label">Total Quantity</label>
              </div>

              <h3 style={{color: '#aaa', fontSize: '0.9rem', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'1rem'}}>Sizes & Prices</h3>
              
              {formData.sizes.map((row, index) => (
                <div key={index} className="sizes-row">
                  <div className="input-field size-input" style={{marginBottom:0}}>
                    <input 
                      className="modern-input"
                      placeholder="Size (e.g. 500ml)"
                      value={row.size}
                      onChange={(e) => handleSizeChange(index, "size", e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-field price-input" style={{marginBottom:0}}>
                    <input 
                      type="number"
                      className="modern-input"
                      placeholder="Price"
                      value={row.price}
                      onChange={(e) => handleSizeChange(index, "price", e.target.value)}
                      required
                    />
                  </div>
                  {formData.sizes.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeSizeRow(index)}
                      style={{background: 'transparent', border: '1px solid #444', color: '#e74c3c', borderRadius: '8px', padding: '0 15px', cursor: 'pointer'}}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button type="button" className="btn-add" onClick={addSizeRow}>
                ➕ Add Another Size
              </button>

              <div className="input-field">
                <input 
                  name="imageUrl"
                  className="modern-input" 
                  placeholder=" " 
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
                <label className="floating-label">Image URL</label>
              </div>

              <div className="action-buttons">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Update Product"}
                </button>
                
                <button 
                  type="button" 
                  className="btn-danger" 
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Product"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="visual-section">
          <div className="grid-bg"></div>
          <svg className="hero-box" viewBox="0 0 200 240">
            <defs>
              <linearGradient id="boxGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'#BF953F', stopOpacity:1}} />
                <stop offset="50%" style={{stopColor:'#FCF6BA', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#B38728', stopOpacity:1}} />
              </linearGradient>
            </defs>
            <rect x="40" y="60" width="120" height="140" fill="url(#boxGold)" rx="5" />
            <path d="M160 60 L200 30 L200 170 L160 200 Z" fill="#B38728" opacity="0.6"/>
            <path d="M40 60 L80 30 L200 30 L160 60 Z" fill="#FCF6BA" opacity="0.3"/>
            <rect x="90" y="60" width="20" height="140" fill="rgba(0,0,0,0.1)"/>
          </svg>
        </div>

      </div>
    </Layout>
  );
}

export default EditProduct;