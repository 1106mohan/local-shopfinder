import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Home() {
  // Simple state to trigger fade-in animation on load
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <>
      {/* --- STYLES START --- */}
      <style>{`
        /* Global Reset & Fonts */
        * { box-sizing: border-box; }
        
        .luxury-wrapper {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #050505;
          color: #fff;
          overflow-x: hidden;
        }

        /* --- NAVBAR STYLES --- */
        .luxury-navbar {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(15px);
          padding: 1rem 2rem;
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }

        .navbar-brand {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0px 2px 10px rgba(212, 175, 55, 0.3);
        }

        .nav-buttons {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        /* Base Button Styles */
        .luxury-btn {
          padding: 10px 25px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
          z-index: 1;
        }

        /* Gold Gradient Button */
        .btn-gold {
          background: linear-gradient(135deg, #BF953F, #B38728, #AA771C);
          color: #000;
          border: none;
          box-shadow: 0 4px 15px rgba(191, 149, 63, 0.4);
        }
        .btn-gold::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 0%; height: 100%;
          background: linear-gradient(135deg, #FCF6BA, #BF953F);
          transition: width 0.3s ease;
          z-index: -1;
        }
        .btn-gold:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(191, 149, 63, 0.6);
        }
        .btn-gold:hover::before { width: 100%; }

        /* Outline Button */
        .btn-outline-luxury {
          background: transparent;
          border: 1px solid #BF953F;
          color: #BF953F;
        }
        .btn-outline-luxury:hover {
          background: #BF953F;
          color: #000;
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(191, 149, 63, 0.3);
        }

        /* --- HERO SECTION STYLES --- */
        .luxury-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          position: relative;
          padding-top: 80px; /* Offset for fixed nav */
        }

        /* Animated Background */
        .hero-bg {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: #000;
          z-index: -2;
        }
        .hero-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(191,149,63,0.15) 0%, rgba(0,0,0,0) 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 6s infinite ease-in-out;
          z-index: -1;
        }

        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
        }

        .hero-content {
          max-width: 800px;
          padding: 20px;
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 1s forwards 0.5s;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          background: linear-gradient(to bottom, #fff, #aaa);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        /* --- UPDATED COLOR SHIFT ANIMATION --- */
        @keyframes colorShift {
          0% { color: #BF953F; text-shadow: 0 0 10px rgba(191, 149, 63, 0.5); }
          20% { color: #fcf6ba; text-shadow: 0 0 15px rgba(252, 246, 186, 0.6); }
          40% { color: #b38728; text-shadow: 0 0 10px rgba(179, 135, 40, 0.5); }
          60% { color: #AA771C; text-shadow: 0 0 20px rgba(170, 119, 28, 0.7); }
          80% { color: #FBF5B7; text-shadow: 0 0 15px rgba(251, 245, 183, 0.6); }
          100% { color: #BF953F; text-shadow: 0 0 10px rgba(191, 149, 63, 0.5); }
        }

        .hero-title span {
          /* Ensure it ignores the parent transparent text color */
          color: #BF953F; 
          /* Apply the animation: 5s duration, infinite loop */
          animation: colorShift 5s infinite ease-in-out;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #ccc;
          margin-bottom: 2.5rem;
          font-weight: 300;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-lg-custom {
          padding: 15px 40px;
          font-size: 1.1rem;
        }

        /* Particle Effect (Subtle Stars) */
        .particle {
          position: absolute;
          background: #BF953F;
          border-radius: 50%;
          opacity: 0.3;
          animation: floatParticle 10s infinite linear;
        }
        @keyframes floatParticle {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }

        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 2.2rem; }
          .luxury-navbar { flex-direction: column; gap: 15px; }
          .hero-buttons { flex-direction: column; width: 100%; }
          .luxury-btn { width: 100%; }
        }
      `}</style>
      {/* --- STYLES END --- */}

      <div className="luxury-wrapper">
        {/* Header */}
        <nav className="luxury-navbar">
          <span className="navbar-brand">Local Shopfinder</span>
          <div className="nav-buttons">
            <Link to="/login" className="luxury-btn btn-outline-luxury">Sign In</Link>
            <Link to="/register" className="luxury-btn btn-gold">Register</Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="luxury-hero">
          <div className="hero-bg"></div>
          <div className="hero-glow"></div>
          
          {/* Decorative Particles */}
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 5 + 2}px`,
                height: `${Math.random() * 5 + 2}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`
              }}
            />
          ))}

          <div className="hero-content">
            <h1 className="hero-title">
              Find Products in <br />
              <span>Nearby Local Shops</span>
            </h1>
            <p className="hero-subtitle">Helping customers discover product availability in real-time with elegance and precision.</p>
            <div className="hero-buttons">
              <Link to="/login" className="luxury-btn btn-outline-luxury btn-lg-custom">Shop Owner Login</Link>
              <Link to="/register" className="luxury-btn btn-gold btn-lg-custom">Register Your Shop</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;