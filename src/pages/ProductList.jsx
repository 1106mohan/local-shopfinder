import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]); // All products from DB
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // NEW: Search State
  const [searchQuery, setSearchQuery] = useState("");
  
  // Track which product is currently being deleted
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem("idToken");
       console.log("Token found:", token ? "YES" : "NO");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // 1. FETCH SHOP ID FIRST
        const shopRes = await fetch("https://1nq17tp97j.execute-api.ap-south-1.amazonaws.com/get-shop", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!shopRes.ok) {
          const errData = await shopRes.json();
          if(shopRes.status === 404) {
             setError("No shop found. Please add a shop first.");
          } else {
             setError("Failed to verify shop.");
          }
          setLoading(false);
          return;
        }

        const shopData = await shopRes.json();
        const shopId = shopData.shopId;
        
        // OPTIONAL: Save it to localStorage just to save API calls next time
        localStorage.setItem("currentShopId", shopId);

        // 2. FETCH PRODUCTS USING THE SHOP ID
        const prodRes = await fetch(`https://1nq17tp97j.execute-api.ap-south-1.amazonaws.com/get-products?shopId=${shopId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const prodData = await prodRes.json();

        if (prodRes.ok) {
          const formattedProducts = prodData.map(item => ({
            id: item.SK ? item.SK.replace("PRODUCT#", "") : "NO_ID_FOUND",
            name: item.itemName,
            price: item.sizes && item.sizes.length > 0 ? `$${item.sizes[0].price}` : "$0.00", 
            stock: item.quantity,
            status: item.quantity > 10 ? "In Stock" : (item.quantity > 0 ? "Low Stock" : "Out of Stock")
          }));

          setProducts(formattedProducts);
        } else {
          setError("Failed to load products.");
        }

      } catch (err) {
        console.error(err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [navigate]);

  // --- NEW: DELETE FUNCTION ---
  const handleDelete = async (productId, productName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${productName}"?`);
    if (!confirmDelete) return;

    setDeletingId(productId); 

    try {
      const token = localStorage.getItem("idToken");
      const shopId = localStorage.getItem("currentShopId");

      if (!shopId) {
        alert("Error: Shop ID missing. Please refresh the page.");
        setDeletingId(null);
        return;
      }

      const res = await fetch("https://1nq17tp97j.execute-api.ap-south-1.amazonaws.com/delete-product", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          shopId: shopId,
          productId: productId
        })
      });

      if (res.ok) {
        // Remove from UI immediately without re-fetching
        setProducts(products.filter(p => p.id !== productId));
      } else {
        const errData = await res.json();
        alert("Failed to delete: " + (errData.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error while deleting.");
    } finally {
      setDeletingId(null); 
    }
  };

  // --- NEW: FILTER LOGIC ---
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="product-list-wrapper">
        {/* --- STYLES --- */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          .product-list-wrapper { font-family: 'Inter', sans-serif; padding: 2rem; background: #050505; min-height: 100vh; color: #ffffff; }
          .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 20px; }
          .header-text h1 { font-size: 2rem; font-weight: 700; margin: 0 0 5px 0; background: linear-gradient(to right, #fff, #BF953F); -webkit-background-clip: text; background-clip: text; color: transparent; }
          .header-text p { color: #888; margin: 0; }
          .search-container { position: relative; width: 100%; max-width: 400px; }
          .search-input { width: 100%; padding: 12px 20px 12px 45px; background: #121212; border: 1px solid #333; border-radius: 50px; color: #fff; outline: none; transition: 0.3s; }
          .search-input:focus { border-color: #BF953F; box-shadow: 0 0 0 4px rgba(191, 149, 63, 0.1); }
          .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #666; }
          .stats-strip { display: flex; gap: 20px; margin-bottom: 2rem; overflow-x: auto; }
          .stat-pill { background: #121212; border: 1px solid #333; padding: 15px 25px; border-radius: 12px; min-width: 150px; flex: 1; }
          .stat-pill h4 { margin: 0; font-size: 1.5rem; color: #fff; }
          .stat-pill span { font-size: 0.85rem; color: #888; text-transform: uppercase; } {/* Fixed typo here */}
          .table-container { background: #121212; border: 1px solid #333; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
          .custom-table { width: 100%; border-collapse: collapse; }
          .custom-table th { text-align: left; padding: 1.2rem; background: #1a1a1a; color: #888; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #333; }
          .custom-table td { padding: 1.2rem; border-bottom: 1px solid #1a1a1a; color: #e0e0e0; vertical-align: middle; }
          .custom-table tr:nth-child(even) td { background: #161616; }
          .custom-table tr:hover td { background: #222; color: #fff; }
          .badge { padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
          .badge-success { background: rgba(46, 204, 113, 0.15); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); }
          .badge-warning { background: rgba(241, 196, 15, 0.15); color: #f1c40f; border: 1px solid rgba(241, 196, 15, 0.3); }
          .badge-danger { background: rgba(231, 76, 60, 0.15); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3); }
          .action-cell { text-align: right; }
          .btn-icon { padding: 8px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid transparent; color: #aaa; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; }
          .btn-icon:hover { background: #333; color: #fff; }
          .btn-edit:hover { background: rgba(191, 149, 63, 0.2); color: #BF953F; border-color: #BF953F; }
          .btn-delete:hover { background: rgba(231, 76, 60, 0.2); color: #e74c3c; border-color: #e74c3c; }
          @media (max-width: 768px) { .table-container { overflow-x: auto; } .stats-strip { flex-direction: column; } }
        `}</style>

        <div className="page-header">
          <div className="header-text">
            <h1>Inventory</h1>
            <p>Manage your product listings and stock levels</p>
          </div>
          
          <div className="search-container">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            {/* CONNECTED VALUE AND ONCHANGE */}
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="stats-strip">
          {/* Stats now show the COUNT of filtered items or total items */}
          <div className="stat-pill">
            <h4>{filteredProducts.length}</h4>
            <span>Total Products</span>
          </div>
          <div className="stat-pill">
            <h4 style={{color: '#2ecc71'}}>{filteredProducts.filter(p => p.status === 'In Stock').length}</h4>
            <span>In Stock</span>
          </div>
          <div className="stat-pill">
            <h4 style={{color: '#e74c3c'}}>{filteredProducts.filter(p => p.status === 'Out of Stock').length}</h4>
            <span>Out of Stock</span>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Loading products...</div>
          ) : error ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#ff5555" }}>{error}</div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Stock Level</th>
                  <th>Status</th>
                  <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* MAP FILTERED PRODUCTS INSTEAD OF 'PRODUCTS' */}
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td style={{fontWeight: '500'}}>{product.name}</td>
                    <td>{product.price}</td>
                    <td>{product.stock} units</td>
                    <td>
                      <span className={`badge ${
                        product.status === 'In Stock' ? 'badge-success' : 
                        product.status === 'Out of Stock' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button
                        className="btn-icon btn-edit"
                        title="Edit"
                        onClick={() => navigate(`/edit-product/${product.id}`)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="btn-icon btn-delete" 
                        title="Delete"
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id ? "..." : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </Layout>
  );
}

export default ProductList;