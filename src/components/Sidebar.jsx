import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userSub");
    navigate("/login");
  };

  return (
    <div 
      className="sidebar-wrapper"
      style={{ 
        width: "250px", 
        backgroundColor: "#000000", 
        color: "#ffffff",
        height: "100vh",
        padding: "2rem 1rem",
        borderRight: "1px solid #333", 
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div>
        <h5 
          style={{ 
            color: "#BF953F", 
            marginBottom: "2rem", 
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontWeight: "700"
          }}
        >
          ShopFinder
        </h5>

        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          <li><Link to="/dashboard" style={linkStyle}>Dashboard</Link></li>
          <li><Link to="/add-shop" style={linkStyle}>Add Shop</Link></li>
          <li><Link to="/add-product" style={linkStyle}>Add Product</Link></li>
          <li><Link to="/products" style={linkStyle}>Product List</Link></li>
          
          {/* Customer Orders Link */}
          <li>
  <Link to="/customer-orders" style={linkStyle}>
    Customer Orders
  </Link>
</li>
        </ul>
      </div>

      <div style={{ marginTop: "auto" }}>
        <button 
          onClick={handleLogout}
          style={{
            ...linkStyle,
            width: "100%",
            textAlign: "left",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#ff5555",
            fontWeight: "600"
          }}
          onMouseEnter={(e) => e.target.style.background = "rgba(255, 85, 85, 0.1)"}
          onMouseLeave={(e) => e.target.style.background = "transparent"}
        >
          Logout
        </button>
      </div>

      <style>{`
        a:hover { background-color: rgba(191, 149, 63, 0.1) !important; color: #fff !important; }
      `}</style>
    </div>
  );
}

const linkStyle = {
  color: "#cccccc", 
  textDecoration: "none",
  padding: "12px 15px",
  borderRadius: "8px",
  display: "block",
  transition: "all 0.3s ease",
  fontSize: "0.95rem"
};

export default Sidebar;