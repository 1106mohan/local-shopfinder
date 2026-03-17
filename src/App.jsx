import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterShop from "./pages/RegisterShop"; 
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import ProductList from "./pages/ProductList";
import EditProduct from "./pages/EditProduct";
import AddShop from "./pages/AddShop"; 
import CustomerOrders from "./pages/CustomerOrders";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />          
        <Route path="/login" element={<Login />} />    
        <Route path="/register" element={<RegisterShop />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/customer-orders" element={<CustomerOrders />} />
        {/* ⭐ FIX 1: Add Shop Route */}
        <Route path="/add-shop" element={<AddShop />} />
        
        <Route path="/add-product" element={<AddProduct />} />
        
        {/* ⭐ FIX 2: Use '/inventory' instead of '/products' to match your navbar/intentions */}
        {/* OR update your Navbar to link to '/products' if you want to keep this */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/inventory" element={<ProductList />} /> {/* Adding both for safety */}
        
        {/* ⭐ FIX 3: Match the parameter name used in EditProduct.js */}
        {/* Change :id to :productId */}
        <Route path="/edit-product/:productId" element={<EditProduct />} />
      </Routes>
    </Router>
  );
}

export default App;