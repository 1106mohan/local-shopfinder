import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar"; 

function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ⭐ NEW: State to track the *selected* status in the dropdown before clicking Update
  // Structure: { orderId: "STATUS" }
  const [selectedStatuses, setSelectedStatuses] = useState({});

  const API_URL = "https://1nq17tp97j.execute-api.ap-south-1.amazonaws.com/seller/orders"; 
  
  // ⭐ REPLACE THIS: You need to create a new Lambda/API endpoint to UPDATE the status
const UPDATE_API_URL = "https://1nq17tp97j.execute-api.ap-south-1.amazonaws.com/seller/update-order-status";
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("idToken");
      
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token 
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      let finalOrders = [];
      if (data.body) {
        try {
          finalOrders = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
        } catch (e) {
          console.error("JSON Parse Error", e);
          finalOrders = [];
        }
      } else {
        finalOrders = data;
      }
      
      setOrders(finalOrders);
      
      // Initialize the selected statuses map with current values
      const initialStatuses = {};
      finalOrders.forEach(order => {
        initialStatuses[order.orderId] = order.status;
      });
      setSelectedStatuses(initialStatuses);

    } catch (err) {
      console.error("Failed to fetch orders", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ NEW: Handle dropdown change (just updates local state, NOT database yet)
  const handleDropdownChange = (orderId, newStatus) => {
    setSelectedStatuses(prev => ({
      ...prev,
      [orderId]: newStatus
    }));
  };

  // ⭐ NEW: Handle the Update Button Click
  const handleUpdateClick = async (orderId) => {
    const newStatus = selectedStatuses[orderId];

    if (!newStatus) {
      alert("Please select a status.");
      return;
    }

    // Show a loading state or just a confirmation
    const confirmUpdate = window.confirm(`Are you sure you want to update status to ${newStatus}?`);
    if (!confirmUpdate) return;

    try {
      const token = localStorage.getItem("idToken");

      // Call the backend API
      const response = await fetch(UPDATE_API_URL, {
        method: "POST", // or PUT depending on your API
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({
          orderId: orderId,
          status: newStatus
          // You might need to pass shopId or SK depending on your DynamoDB design
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // If successful:
      alert("Order status updated successfully! User will be notified.");

      // Update the main list to reflect the change immediately
      const updatedOrders = orders.map(order => {
        if (order.orderId === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });
      setOrders(updatedOrders);

    } catch (err) {
      console.error(err);
      alert("Error updating status: " + err.message);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      
      <div style={{ flex: 1, padding: "2rem", backgroundColor: "#f4f4f4" }}>
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Customer Orders</h2>

        {loading && <p>Loading orders...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {!loading && !error && orders.length === 0 && (
          <p>No orders found for your shop.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((order) => (
            <div 
              key={order.orderId} 
              style={{ 
                background: "#fff", 
                padding: "20px", 
                borderRadius: "10px", 
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                borderLeft: "5px solid #BF953F" 
              }}
            >
              {/* Order Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Order ID: {order.orderId}</h3>
                  
                  {/* Display current status tag (based on 'order.status' from DB) */}
                  {order.status === "PLACED" && <span style={getStatusStyle("PLACED")}>NEW</span>}
                  {order.status === "ACCEPTED" && <span style={getStatusStyle("ACCEPTED")}>ACCEPTED</span>}
                  {order.status === "PACKED" && <span style={getStatusStyle("PACKED")}>PACKED</span>}
                  {order.status === "SHIPPED" && <span style={getStatusStyle("SHIPPED")}>SHIPPED</span>}
                  {order.status === "DELIVERED" && <span style={getStatusStyle("DELIVERED")}>DELIVERED</span>}
                  {!["PLACED", "ACCEPTED", "PACKED", "SHIPPED", "DELIVERED"].includes(order.status) && <span style={getStatusStyle("OTHER")}>{order.status}</span>}
                </div>

                <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "10px" }}>
                  <p style={{ margin: 0, fontWeight: "bold", color: "#333" }}>
                    Total: ₹{order.totalAmount}
                  </p>
                  
                  {/* ⭐ NEW: Dropdown (controlled by selectedStatuses state) */}
                  <select 
  value={selectedStatuses[order.orderId] || order.status}
  onChange={(e) => handleDropdownChange(order.orderId, e.target.value)}
  disabled={order.status === "CANCELLED"}
  style={{
    padding: "5px 10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "0.9rem",
    cursor: order.status === "CANCELLED" ? "not-allowed" : "pointer",
    backgroundColor: order.status === "CANCELLED" ? "#f5f5f5" : "#fff",
    opacity: order.status === "CANCELLED" ? 0.6 : 1
  }}
>
                    <option value="PLACED">New Order</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="PACKED">Packed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>

                  {/* ⭐ NEW: Update Button */}
                 <button 
  onClick={() => handleUpdateClick(order.orderId)}
  disabled={order.status === "CANCELLED"}
  style={{
    padding: "5px 15px",
    backgroundColor: order.status === "CANCELLED" ? "#ccc" : "#BF953F",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: order.status === "CANCELLED" ? "not-allowed" : "pointer",
    fontWeight: "bold",
    fontSize: "0.9rem",
    opacity: order.status === "CANCELLED" ? 0.6 : 1
  }}
>
                    Update
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {/* Customer Details */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <h4 style={{ fontSize: "0.95rem", color: "#555", marginBottom: "8px" }}>Customer Details</h4>
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Name:</strong> {order.customerName}</p>
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Email:</strong> {order.customerEmail}</p>
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Phone:</strong> {order.customerPhone}</p>
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Address:</strong> {order.deliveryAddress}, {order.deliveryPincode}</p>
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Payment:</strong> {order.paymentMethod}</p>
                </div>

                {/* Items List */}
                <div style={{ flex: 2, minWidth: "300px" }}>
                  <h4 style={{ fontSize: "0.95rem", color: "#555", marginBottom: "8px" }}>Items</h4>
                  {order.items && order.items.length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                      <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                          <th style={{ padding: "8px" }}>Product</th>
                          <th style={{ padding: "8px" }}>Size</th>
                          <th style={{ padding: "8px" }}>Qty</th>
                          <th style={{ padding: "8px" }}>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, index) => (
                          <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "8px" }}>{item.itemName}</td>
                            <td style={{ padding: "8px" }}>{item.size}</td>
                            <td style={{ padding: "8px" }}>{item.quantity}</td>
                            <td style={{ padding: "8px" }}>₹{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: "#888", fontStyle: "italic" }}>No items in this order.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper function for cleaner status styles
const getStatusStyle = (status) => {
  const base = { padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" };
  switch (status) {
    case "PLACED": return { ...base, backgroundColor: "#e3f2fd", color: "#1565c0" };
    case "ACCEPTED": return { ...base, backgroundColor: "#fff3e0", color: "#ef6c00" };
    case "PACKED": return { ...base, backgroundColor: "#f3e5f5", color: "#7b1fa2" };
    case "SHIPPED": return { ...base, backgroundColor: "#e0f2f1", color: "#00695c" };
    case "DELIVERED": return { ...base, backgroundColor: "#e8f5e9", color: "#2e7d32" };
    default: return { ...base, backgroundColor: "#eeeeee", color: "#616161" };
  }
};

export default CustomerOrders;