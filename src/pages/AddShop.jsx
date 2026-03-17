import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout"; // <--- Make sure this is imported
import LocationPicker from "../components/LocationPicker";

function AddShop() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const initialLat = latitude || 20.5937;
  const initialLng = longitude || 78.9629;

  const updateAddressFromCoords = async (lat, lng) => {
    if (!lat || !lng) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      
      if (data && data.display_name) {
        console.log("Updating address to:", data.display_name);
        setAddress(data.display_name);
        
        if (data.address && data.address.postcode) {
          setPincode(data.address.postcode);
        }
      }
    } catch (err) {
      console.error("Error fetching address:", err);
    }
  };

  useEffect(() => {
    if (latitude && longitude && latitude !== 20.5937) {
      const timer = setTimeout(() => {
        updateAddressFromCoords(latitude, longitude);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [latitude, longitude]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser.");
      return;
    }
    setMessage("Detecting location...");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setMessage("✅ Location detected!");
      },
      (error) => {
        console.error(error);
        setMessage("❌ Unable to retrieve your location.");
      }
    );
  };

  const fetchLocationFromPincode = async (code) => {
    if (!/^\d{6}$/.test(code)) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${code}&country=India&format=json`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        setLatitude(lat);
        setLongitude(lon);
        setMessage(`📍 Location found for ${code}`);
      } else {
        setMessage("❌ Could not find location for this pincode.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error fetching location");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("idToken");
    if (!token) {
      setMessage("You must be logged in to add a shop.");
      navigate("/login");
      return;
    }

    if (!latitude || !longitude) {
      setMessage("Please select location on map.");
      return;
    }

    const shopData = {
      shopName,
      ownerName,
      address,
      pincode,
      latitude,
      longitude
    };

    try {
      const res = await fetch("https://1nq17tp97j.execute-api.ap-south-1.amazonaws.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(shopData)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Shop added successfully!");
        navigate("/dashboard");
      } else {
        setMessage("Error: " + (data.error || "Failed to add shop"));
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error");
    }
  };

  // ✅ WRAPPED IN LAYOUT
  return (
  <Layout>
    <div className="addshop-wrapper">
      <style>{`
        .addshop-wrapper {
          min-height: 100vh;
          padding: 60px 20px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          background: linear-gradient(135deg, #050505, #0f0f0f);
        }

        .addshop-card {
          width: 100%;
          max-width: 850px;
          padding: 50px;
          background: rgba(18,18,18,0.85);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
        }

        .page-title {
          font-size: 2.3rem;
          font-weight: 700;
          margin-bottom: 10px;
          background: linear-gradient(to right, #fff, #aaa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .page-subtitle {
          color: #888;
          margin-bottom: 40px;
        }

        .form-group {
          margin-bottom: 1.8rem;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #BF953F;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .form-input {
          width: 100%;
          padding: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #BF953F;
          box-shadow: 0 0 0 4px rgba(191,149,63,0.15);
          background: rgba(255,255,255,0.06);
        }

        .location-btn {
          width: 100%;
          padding: 14px;
          background: rgba(191,149,63,0.08);
          border: 1px dashed #BF953F;
          color: #BF953F;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          margin-bottom: 15px;
        }

        .location-btn:hover {
          background: #BF953F;
          color: #000;
        }

        .map-container {
          height: 420px;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          position: relative;
        }

        .map-overlay-text {
          position: absolute;
          top: 15px;
          left: 15px;
          background: rgba(0,0,0,0.8);
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          border: 1px solid #333;
          z-index: 1000;
        }

        .submit-btn {
          margin-top: 30px;
          padding: 18px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #BF953F, #FCF6BA);
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s ease;
          box-shadow: 0 15px 30px rgba(191,149,63,0.4);
        }

        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 25px 50px rgba(191,149,63,0.6);
        }

        .error-msg {
          margin-top: 20px;
          padding: 12px;
          background: rgba(255, 0, 0, 0.08);
          border-left: 4px solid #ff4444;
          border-radius: 8px;
          color: #ff7777;
        }
      `}</style>

      <div className="addshop-card">
        <h2 className="page-title">Add New Shop</h2>
        <p className="page-subtitle">
          Fill in your shop details and set its exact location on the map.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Shop Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Central Grocery Store"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Owner Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. John Doe"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Address</label>
            <input
              className="form-input"
              type="text"
              placeholder="Address will auto-fill..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pincode (India)</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. 560001"
              value={pincode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPincode(val);
                if (val.length === 6) fetchLocationFromPincode(val);
              }}
              maxLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Shop Location</label>

            <button
              type="button"
              className="location-btn"
              onClick={handleGetCurrentLocation}
            >
              📍 Use My Current Location
            </button>

            <div className="map-container">
              <div className="map-overlay-text">
                Click map to auto-fill address
              </div>
              <LocationPicker
                latitude={initialLat}
                longitude={initialLng}
                setLatitude={setLatitude}
                setLongitude={setLongitude}
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Save Shop Details
          </button>

          {message && <div className="error-msg">{message}</div>}
        </form>
      </div>
    </div>
  </Layout>
);
}

export default AddShop;