import Layout from "../components/Layout"; // <--- Ensure this is imported
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [ownerName, setOwnerName] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("idToken");
      if (!token) return;

      try {
        // 1. Fetch Shop ID
        const shopRes = await fetch("https://1nq17tp97j.execute-api.ap-south-1.amazonaws.com/get-shop", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!shopRes.ok) return;
        
        const shopData = await shopRes.json();
        const shopId = shopData.shopId;
        localStorage.setItem("currentShopId", shopId); // Cache it

        // 2. Fetch Products
        const prodRes = await fetch(`https://1nq17tp97j.execute-api.ap-south-1.amazonaws.com/get-products?shopId=${shopId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 2. Calculate Real Stats
  const totalProducts = products.length;
  
  // FIX: Logic to find low stock items (Quantity less than 10)
  const lowStockItems = products.filter(p => Number(p.quantity) < 10); 
  const lowStockCount = lowStockItems.length;

  return (
    <Layout> {/* <--- WRAPPED IN LAYOUT */}
      <div className="dashboard-container">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

          .dashboard-container {
            font-family: 'Inter', sans-serif;
            padding: 2rem;
            background-color: #000000;
            min-height: 100vh;
            color: #ffffff;
          }

          .welcome-header { margin-bottom: 3rem; padding-bottom: 1rem; border-bottom: 1px solid #333; }
          .welcome-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            background: linear-gradient(to right, #fff, #BF953F);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .welcome-desc { color: #cccccc; font-size: 1.1rem; }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 3rem;
          }

          .glass-card {
            background-color: #121212;
            border: 1px solid #333333;
            border-radius: 16px;
            padding: 2rem;
            transition: all 0.3s ease;
            position: relative;
          }
          .glass-card:hover { border-color: #BF953F; transform: translateY(-5px); }

          .gold-line {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 4px;
            background: linear-gradient(90deg, #BF953F, #FCF6BA);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .glass-card:hover .gold-line { opacity: 1; }

          .card-label {
            color: #aaaaaa;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .card-value {
            font-size: 3rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 5px;
            line-height: 1;
          }

          .card-subtext { color: #777777; font-size: 0.9rem; }

          .alert-section {
            background-color: #121212;
            border: 1px solid #333333;
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 3rem;
          }
          .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #e74c3c;
          }

          .custom-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #333333;
          }
          .custom-table th {
            text-align: left;
            color: #ffffff;
            font-weight: 600;
            background-color: #1a1a1a;
            padding: 1rem;
            border-bottom: 1px solid #444;
          }
          .custom-table td {
            background-color: #121212;
            padding: 1rem;
            color: #eeeeee;
            border-bottom: 1px solid #333333;
          }
          .custom-table tr:nth-child(even) td { background-color: #1a1a1a; }
          .custom-table tr:hover td { background-color: #222; color: #fff; }

          .text-danger-custom { color: #ff5555; font-weight: 700; }
          .text-success-custom { color: #2ecc71; font-weight: 700; }

          .action-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #121212;
            border: 1px solid #333333;
            padding: 2rem;
            border-radius: 16px;
            flex-wrap: wrap;
            gap: 20px;
          }

          .action-btn {
            padding: 14px 30px;
            border-radius: 50px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-size: 1rem;
          }

          .btn-gold {
            background: linear-gradient(135deg, #BF953F, #B38728);
            color: #000;
            border: 1px solid #BF953F;
          }
          .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(191, 149, 63, 0.5); }

          .btn-outline {
            background: transparent;
            border: 1px solid #BF953F;
            color: #BF953F;
          }
          .btn-outline:hover { background: rgba(191, 149, 63, 0.1); }

          .btn-shop {
            background: #2c3e50;
            border: 1px solid #34495e;
            color: #ecf0f1;
          }
          .btn-shop:hover { background: #34495e; color: #fff; }
          
          /* FIX: Flex layout for Quick Actions */
          .flex-row { display: flex; gap: 10px; }

          @media (max-width: 768px) {
            .stats-grid { grid-template-columns: 1fr; }
            .welcome-title { font-size: 1.8rem; }
            .action-section { flex-direction: column; align-items: flex-start; }
          }
        `}</style>

        {/* Welcome Section */}
        <div className="welcome-header">
          <h1 className="welcome-title">Welcome, {ownerName}</h1> {/* <--- FIXED SYNTAX > was missing */}
          <p className="welcome-desc">Manage your product availability and keep your shop visible to nearby customers.</p>
        </div>

        {/* Summary Cards */}
        <div className="stats-grid">
          {/* Total Products */}
          <div className="glass-card">
            <div className="gold-line"></div>
            <div className="card-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 2 2h14a2 2 0 0 2 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 1-8 0"></path></svg>
              Total Products
            </div>
            <div className="card-value">
              {loading ? "..." : totalProducts}
            </div>
            <div className="card-subtext">Products currently listed</div>
          </div>

          {/* Low Stock */}
          <div className="glass-card">
            <div className="gold-line" style={{background: '#e74c3c'}}></div>
            <div className="card-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Low Stock Items
            </div>
            <div className="card-value text-danger-custom">
              {loading ? "..." : lowStockCount}
            </div>
            <div className="card-subtext">Need restocking soon</div>
          </div>

          {/* Visibility */}
          <div className="glass-card">
            <div className="gold-line" style={{background: '#2ecc71'}}></div>
            <div className="card-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Shop Visibility
            </div>
            <div style={{fontSize: '1.5rem', fontWeight: '700', color: '#2ecc71', marginBottom: '5px'}}>Active</div>
            <div className="card-subtext">Visible to Nearby Users</div>
          </div>
        </div>

        {/* Low Stock Alert Section */}
        <div className="alert-section">
          <h5 className="section-title">⚠️ Low Stock Alerts</h5>
          {loading ? (
            <div style={{padding:'1rem', color:'#888'}}>Loading...</div>
          ) : lowStockItems.length === 0 ? (
            <div style={{padding:'1rem', color:'#888'}}>All stocks are healthy! 🎉</div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity Left</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.itemName}</td>
                    <td className="text-danger-custom">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Actions */}
        <div className="action-section">
          <div>
            <h5 style={{marginBottom: '5px', color: '#fff'}}>Quick Actions</h5>
            <small style={{color: '#888'}}>Efficiently manage your inventory</small>
          </div>
          <div className="flex-row"> {/* <--- FIX: Changed d-flex to flex-row */}
            {/* Add Shop Button */}
            <Link to="/add-shop" className="action-btn btn-shop">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-2a2 2 0 1 2-2h4a2 2 0 1 2 2v2M10 9a2 2 0 1 0 0 4z"/></svg>
              Add New Shop
            </Link>

            {/* Add Product Button */}
            <Link to="/add-product" className="action-btn btn-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add New Product
            </Link>
            
            {/* View Products Button */}
            <Link to="/products" className="action-btn btn-outline">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0-2 2v16a2 2 0 0 2 2h12a2 2 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9"></polyline></svg>
              View All Products
            </Link>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default Dashboard;