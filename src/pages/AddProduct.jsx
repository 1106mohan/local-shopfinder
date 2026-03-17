import { useState } from "react";
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import Layout from "../components/Layout";

// MOCK DATABASE
const PRODUCT_CATALOG = {
  "8901052500051": { name: "Coca Cola 500ml", company: "Coca Cola", price: 20, category: "Beverages" },
  "8906001025031": { name: "Lays Magic Masala", company: "PepsiCo", price: 10, category: "Packaged Foods" },
  "4006381333931": { name: "Fanta Orange 500ml", company: "Coca Cola", price: 20, category: "Beverages" }
};

// ✅ CATEGORY OPTIONS
const CATEGORY_OPTIONS = [
  "Vegetables",
  "Fruits",
  "Dairy",
  "Toys",
  "Stationary",
  "Electronics",
  "Packaged Foods",
  "Masalas",
  "Sweets",
  "Cold Drinks",
  "Skin Care",
  "Hair Care",
  "Clothes",
  "Beverages",
  "Grocery",
  "Snacks" // ✅ ADDED HERE
];

function AddProduct() {
  const [productName, setProductName] = useState("");
  const [company, setCompany] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState(""); // State for dropdown
  const [sizes, setSizes] = useState([{ size: "", price: "" }]);
  const [compressedImage, setCompressedImage] = useState(null);

  // SCANNER STATE
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  // Helper: Convert File/Blob to Base64 String
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const compressImage = (file, maxWidth = 800, quality = 0.6) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = maxWidth / img.width;

        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          quality
        );
      };
    });
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.connect(ctx.destination);
      osc.frequency.value = 1000;
      osc.type = "sine";
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const compressedBlob = await compressImage(file);

  // Store blob directly (NO base64)
  setCompressedImage(compressedBlob);
};

  const onScanSuccess = (decodedText, decodedResult) => {
    if (scanResult === decodedText) return;

    console.log("✅ Scanned Barcode:", decodedText);
    setScanResult(decodedText);
    playBeep();
    setScanError(null);

    const productInfo = PRODUCT_CATALOG[decodedText];

    if (productInfo) {
      setProductName(productInfo.name);
      setCompany(productInfo.company);
      setCategory(productInfo.category || "");
      setSizes([{ size: "1 Unit", price: productInfo.price }]);
      alert(`Found: ${productInfo.name}`);
      setIsScanning(false);
    } else {
      alert(`Barcode ${decodedText} not found in catalog.`);
      setIsScanning(false);
    }
  };

  const onScanFailure = (error) => {
    if(error) console.log(error); 
  };

  const handleSizeChange = (index, field, value) => {
    const updated = [...sizes];
    updated[index][field] = value;
    setSizes(updated);
  };

  const addSizeRow = () => setSizes([...sizes, { size: "", price: "" }]);
  const removeSizeRow = (index) => setSizes(sizes.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("idToken");
  if (!token) return alert("Login expired.");

  if (!compressedImage) {
    return alert("Please upload a product image.");
  }

  try {

    // ================================
    // 1️⃣ GET PRESIGNED URL FROM BACKEND
    // ================================

    const uploadUrlResponse = await fetch(
      "https://1nq17tp97j.execute-api.ap-south-1.amazonaws.com/generate-upload-url",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    if (!uploadUrlResponse.ok) {
      throw new Error("Failed to generate upload URL");
    }

    const uploadData = await uploadUrlResponse.json();

    const { uploadUrl, imageKey } = uploadData;

    // ================================
    // 2️⃣ CONVERT BASE64 → BLOB
    // ================================

const imageBlob = compressedImage;

// Convert Blob → ArrayBuffer
const arrayBuffer = await imageBlob.arrayBuffer();

const s3Upload = await fetch(uploadUrl, {
  method: "PUT",
  body: arrayBuffer
});

    if (!s3Upload.ok) {
      throw new Error("Image upload failed");
    }

    // ================================
    // 4️⃣ SEND PRODUCT DATA TO BACKEND
    // ================================

    const productData = {
      itemName: productName,
      company,
      quantity: Number(quantity),
      category,
      sizes: sizes.map(s => ({
        size: s.size,
        price: Number(s.price)
      })),
      imageKey: imageKey   // 🔥 Only sending key now
    };

    const res = await fetch(
      "https://1nq17tp97j.execute-api.ap-south-1.amazonaws.com/add-product",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      }
    );

    const data = await res.json();

    if (res.ok) {
      alert("Product added successfully!");

      // Reset form
      setProductName("");
      setCompany("");
      setCategory("");
      setQuantity("");
      setSizes([{ size: "", price: "" }]);
      setCompressedImage(null);
      setScanResult(null);
      e.target.reset();

    } else {
      alert("Failed: " + (data.error || "Unknown error"));
    }

  } catch (err) {
    console.error("Error:", err);
    alert("Upload failed. Please try again.");
  }
};

  // ✅ Style for the Dropdown to match other inputs
  const selectStyle = {
    width: "100%", 
    padding: "12px", 
    background: "#121212", 
    border: "1px solid #333", 
    color: "#fff", 
    borderRadius: "8px", 
    boxSizing: "border-box",
    appearance: "none", // Removes default OS arrow
    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23BF953F%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right .7em top 50%",
    backgroundSize: ".65em auto"
  };

  const inputStyle = {
    width: "100%", padding: "12px", background: "#121212", border: "1px solid #333", color: "#fff", borderRadius: "8px", boxSizing: "border-box"
  };

  const btnStyle = {
  padding: "8px 16px",
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  border: "1px solid #444",
  borderRadius: "8px",
  cursor: "pointer"
};

  const submitStyle = {
    width: "100%", padding: "15px", background: "linear-gradient(135deg, #BF953F, #B38728)", color: "#000", border: "none", borderRadius: "8px", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer"
  };

  return (
    <Layout>
<div className="addproduct-wrapper">
          <h2 style={{marginBottom: "20px", color: "#BF953F", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <span>Add Product</span>
          <button 
            type="button"
            onClick={() => setIsScanning(!isScanning)}
            style={{
              padding: "10px 20px", 
              background: isScanning ? "#e74c3c" : "#2ecc71", 
              color: "#fff", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "bold"
            }}
          >
            {isScanning ? "🛑 Close Camera" : "📸 Scan Barcode"}
          </button>
        </h2>

        {isScanning && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.95)", zIndex: 9999,
            display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
          }}>
            <div style={{
              width: "100%", maxWidth: "500px",
              background: "#000", border: "2px solid #BF953F",
              borderRadius: "12px", overflow: "hidden", position: "relative"
            }}>
              <BarcodeScannerComponent
                width={500}
                height={500}
                facingMode="environment"
                videoConstraints={{
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  facingMode: "environment"
                }}
                delay={150}
                onUpdate={(err, result) => {
                  if (err) return;
                  if (result) {
                    onScanSuccess(result.text, result);
                  }
                }}
              />
              <div style={{
                position: "absolute", bottom: 20, left: 0, width: "100%", textAlign: "center",
                pointerEvents: "none", color: "#fff", fontSize: "1.2rem", fontWeight: "bold",
                textShadow: "0 0 10px #000"
              }}>
                Point camera at Barcode
              </div>
            </div>
            
            <button 
              type="button"
              onClick={() => setIsScanning(false)}
              style={{marginTop: "20px", padding: "12px 30px", background: "#333", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer"}}
            >
              Cancel
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{opacity: isScanning ? 0.3 : 1, pointerEvents: isScanning ? "none" : "auto"}}>
          <div style={{marginBottom: "15px"}}>
            <label style={{display:"block", marginBottom:"5px", color:"#aaa"}}>Product Name</label>
            <input 
              style={inputStyle}
              placeholder="Product Name" 
              value={productName} 
              onChange={(e) => setProductName(e.target.value)} 
              required 
            />
          </div>
          
          <div style={{marginBottom: "15px"}}>
            <label style={{display:"block", marginBottom:"5px", color:"#aaa"}}>Company Name</label>
            <input 
              style={inputStyle}
              placeholder="Company Name" 
              value={company} 
              onChange={(e) => setCompany(e.target.value)} 
              required 
            />
          </div>

          {/* ✅ CATEGORY DROPDOWN */}
          <div style={{marginBottom: "15px"}}>
            <label style={{display:"block", marginBottom:"5px", color:"#aaa"}}>Category</label>
            <select 
              style={selectStyle}
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              required
            >
              <option value="" disabled>Select Category</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{marginBottom: "15px"}}>
            <label style={{display:"block", marginBottom:"5px", color:"#aaa"}}>Quantity</label>
            <input 
              style={inputStyle}
              type="number" 
              placeholder="Total Quantity" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              required 
            />
          </div>
          
          <div style={{marginBottom: "15px"}}>
            <label style={{display:"block", marginBottom:"5px", color:"#aaa"}}>Sizes & Prices</label>
            {sizes.map((row, index) => (
              <div key={index} style={{display:"flex", gap:"10px", marginBottom:"10px"}}>
                <input style={{...inputStyle, flex:1}} placeholder="Size" value={row.size} onChange={e => handleSizeChange(index, "size", e.target.value)} />
                <input style={{...inputStyle, flex:1}} type="number" placeholder="Price" value={row.price} onChange={e => handleSizeChange(index, "price", e.target.value)} />
                {sizes.length > 1 && (
                  <button type="button" onClick={() => removeSizeRow(index)} style={{background:"#e74c3c", color:"white", border:"none", borderRadius:"8px", padding:"0 15px"}}>X</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addSizeRow} style={btnStyle}>+ Add Size</button>
          </div>

          <div style={{marginBottom: "20px"}}>
            <label style={{display:"block", marginBottom:"5px", color:"#aaa"}}>Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} required style={{color: "#fff"}} />
          </div>

          <button type="submit" style={submitStyle}>
            Save Product
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default AddProduct;