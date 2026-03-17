import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import { userPool } from "../cognitoConfig";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import loginImage from "../assets/locall.png";
function Login() {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Animation & Interaction States
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

  // Track mouse for interactive background effect
  const handleMouseMove = (e) => {
    if (window.innerWidth > 768) {
      const x = (e.clientX / window.innerWidth) * 20;
      const y = (e.clientY / window.innerHeight) * 20;
      setMousePosition({ x, y });
    }
  };

  useEffect(() => {
    setIsLoaded(true);
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleLogin = (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const userData = {
    Username: email,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  cognitoUser.authenticateUser(authDetails, {
    onSuccess: (result) => {
  console.log("Login success", result);

  const idToken = result.getIdToken().getJwtToken();
  const payload = result.getIdToken().decodePayload();

  // Store token
  localStorage.setItem("idToken", idToken);

  // Store user info
  localStorage.setItem("userEmail", payload.email);
  localStorage.setItem("userSub", payload.sub); // unique Cognito user id

  console.log("Logged in user:", payload.email);
  console.log("User sub:", payload.sub);

  navigate("/dashboard");
},


    onFailure: (err) => {
      console.error(err);
      setError(err.message || "Login failed");
      setLoading(false);
    },
  });
};


  return (
    <>
      {/* --- STYLES START --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .professional-wrapper {
          font-family: 'Inter', sans-serif;
          height: 100vh;
          width: 100vw;
          display: flex;
          background-color: #000;
          overflow: hidden;
        }

        /* --- LEFT SIDE: FORM AREA --- */
        .form-side {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          background: linear-gradient(135deg, #0a0a0a 0%, #111 100%);
          z-index: 2;
        }

        /* Interactive Background Glow */
        .glow-orb {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(191,149,63,0.08) 0%, rgba(0,0,0,0) 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          transition: transform 0.1s ease-out;
        }

        /* Glass Card */
        .glass-card {
          width: 100%;
          max-width: 420px;
          padding: 3rem;
          background: rgba(20, 20, 20, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInCard 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards 0.2s;
        }

        @keyframes fadeInCard {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Typography */
        .form-header { margin-bottom: 2.5rem; text-align: left; }
        .form-title { 
          font-size: 2rem; 
          font-weight: 700; 
          color: #fff; 
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #fff, #aaa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .form-subtitle { color: #888; font-size: 0.95rem; }

        /* Floating Label Inputs */
        .input-group { position: relative; margin-bottom: 1.5rem; }
        
        .custom-input {
          width: 100%;
          padding: 16px 45px 16px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .custom-input:focus {
          background: rgba(255, 255, 255, 0.06);
          border-color: #BF953F;
          box-shadow: 0 0 0 4px rgba(191, 149, 63, 0.1);
        }

        .custom-input::placeholder { color: #555; }

        .input-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #555;
          transition: color 0.3s;
        }
        .custom-input:focus ~ .input-icon { color: #BF953F; }

        .toggle-password {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          background: none;
          border: none;
          color: #555;
          transition: color 0.2s;
        }
        .toggle-password:hover { color: #fff; }

        /* Buttons & Links */
        .login-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #BF953F, #B38728);
          color: #000;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(191, 149, 63, 0.3);
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(191, 149, 63, 0.5);
        }

        .login-btn:active { transform: translateY(0); }

        .footer-links {
          margin-top: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }

        .text-link { color: #BF953F; text-decoration: none; font-weight: 500; }
        .text-link:hover { text-decoration: underline; }
        
        .remember-me { display: flex; align-items: center; gap: 8px; color: #888; cursor: pointer; }
        .remember-me input { accent-color: #BF953F; cursor: pointer; }

        /* --- RIGHT SIDE: VISUAL --- */
        .visual-side {
          flex: 1;
          background: #050505;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
.top-left-btn {
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 1000;
}

.back-btn {
  padding: 10px 18px;
  border-radius: 30px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(20,20,20,0.6);
  backdrop-filter: blur(10px);
  color: #BF953F;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(191,149,63,0.15);
  transform: translateX(-3px);
  box-shadow: 0 8px 20px rgba(191,149,63,0.3);
}
        .grid-bg {
          position: absolute;
          width: 200%;
          height: 200%;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px);
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
          0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); }
          100% { transform: perspective(500px) rotateX(60deg) translateY(40px) translateZ(-200px); }
        }

        /* Floating 3D Bag SVG */
        .hero-visual {
  width: 75%;
  max-width: 400px;
  object-fit: contain;
  animation: floatObject 6s ease-in-out infinite;
  filter: drop-shadow(0 20px 40px rgba(191, 149, 63, 0.2));
}

        @keyframes floatObject {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }

        /* Responsive */
        @media (max-width: 900px) {
          .visual-side { display: none; }
          .form-side { background: #0a0a0a; }
          .professional-wrapper { display: block; }
          .glass-card { margin: 20px; padding: 2rem; }
        }
      `}</style>
      {/* --- STYLES END --- */}

      <div className="professional-wrapper">
        <div className="top-left-btn">
  <button onClick={() => navigate("/")} className="back-btn">
    ← Home
  </button>
</div>
        {/* Left Side: Login Form */}
        <div className="form-side">
          {/* Interactive Glow */}
          <div 
            className="glow-orb" 
            style={{ 
              transform: `translate(calc(-50% + ${mousePosition.x}px), calc(-50% + ${mousePosition.y}px))` 
            }}
          />
          {/* NOTE: Used self-closing div <div /> above for valid React */}

          <div className="glass-card">
            <div className="form-header">
              <div style={{ marginBottom: '1rem', display: 'inline-block' }}>
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#BF953F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <h1 className="form-title">Welcome Back</h1>
              <p className="form-subtitle">Enter your credentials to manage your shop.</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input 
  className="custom-input" 
  placeholder="Email Address" 
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required 
/>

                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>

              <div className="input-group">
                <input 
  className="custom-input" 
  placeholder="Password" 
  type={passwordVisible ? "text" : "password"}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required 
/>

                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  
                  {passwordVisible ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>

              <div className="footer-links">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <Link to="#" className="text-link">Forgot Password?</Link>
              </div>

              <button className="login-btn" style={{ marginTop: '1.5rem' }}>Sign In</button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Don't have a shop yet? <Link to="/register" className="text-link">Get Started</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Visuals */}
        <div className="visual-side">
          <div className="grid-bg" />
          
          {/* High Quality Shopping Bag SVG */}
         <img 
  src={loginImage}
  alt="Login Visual"
  className="hero-visual"
/>
        </div>
      </div>
    </>
  );
}

export default Login; // ⭐ THIS LINE MUST EXIST