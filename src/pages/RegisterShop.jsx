import { useState, useEffect } from "react";
import { CognitoUserAttribute, CognitoUser } from "amazon-cognito-identity-js";
import { userPool } from "../cognitoConfig";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSignUp = (e) => {
    e.preventDefault();
    setMessage("");

    const attributeList = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "name", Value: name }),
      new CognitoUserAttribute({ Name: "phone_number", Value: phone })
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        setMessage(err.message || "Sign up failed");
        return;
      }
      setMessage("OTP sent to your email!");
      setStep(2);
    });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const user = new CognitoUser({ Username: email, Pool: userPool });

    user.confirmRegistration(otp, true, (err, result) => {
      if (err) {
        setMessage(err.message || "Invalid OTP");
        return;
      }
      setMessage("Account verified! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    });
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background: #000;
        }

        .register-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(135deg, #050505 0%, #0e0e0e 100%);
}

.register-card {
  position: relative;
  width: 100%;
  max-width: 500px;
  padding: 4rem 3rem;
  background: rgba(18, 18, 18, 0.75);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 30px;
  box-shadow: 0 40px 80px rgba(0,0,0,0.7);
  transform: translateY(20px);
  opacity: 0;
  animation: fadeIn 0.8s ease forwards;
}

@keyframes fadeIn {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.gold-btn {
  width: 100%;
  padding: 16px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #BF953F, #FCF6BA);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(191,149,63,0.4);
}

.gold-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(191,149,63,0.6);
}


.background-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(191,149,63,0.15) 0%, transparent 70%);
  top: -100px;
  left: -100px;
  animation: floatGlow 8s ease-in-out infinite alternate;
  filter: blur(40px);
}

@keyframes floatGlow {
  0% { transform: translate(0, 0); }
  100% { transform: translate(100px, 80px); }
}

        .title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  letter-spacing: 0.5px;
          background: linear-gradient(to right, #fff, #aaa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: #888;
          margin-bottom: 2.5em;
          font-size: 1rem;
        }

        .input-field {
          width: 100%;
          padding: 14px;
          margin-bottom: 1.4rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: #fff;
          outline: none;
          transition: 0.3s;
        }

       .input-field:focus {
  border-color: #BF953F;
  box-shadow: 0 0 0 4px rgba(191,149,63,0.15);
  background: rgba(255,255,255,0.06);
  transform: scale(1.02);
}


        .gold-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #BF953F, #B38728);
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
        }
.top-left-btn {
  position: absolute;
  top: 30px;
  left: 30px;
}

.step-indicator {
  display: flex;
  gap: 10px;
  margin-bottom: 2rem;
}

.step {
  height: 6px;
  flex: 1;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  transition: 0.4s;
}

.step.active {
  background: linear-gradient(90deg, #BF953F, #FCF6BA);
  box-shadow: 0 0 10px rgba(191,149,63,0.6);
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
        .gold-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(191,149,63,0.4);
        }

        .link-text {
          color: #BF953F;
          text-decoration: none;
          font-weight: 500;
        }

        .message {
          margin-top: 1rem;
          color: #BF953F;
          font-size: 0.9rem;
        }

        @media(max-width: 500px){
          .register-card {
            position: relative;

            margin: 20px;
            padding: 2rem;
          }
        }
      `}</style>

      <div className="register-wrapper">

  {/* Top Left Button */}
  <div className="top-left-btn">
    <button onClick={() => navigate("/")} className="back-btn">
      ← Home
    </button>
  </div>
<div className="background-glow" />
<div className="step-indicator">
  <div className={`step ${step === 1 ? "active" : ""}`}></div>
  <div className={`step ${step === 2 ? "active" : ""}`}></div>
</div>
  {/* Card */}
  <div className="register-card">

    <h2 className="title">
      {step === 1 ? "Create Account" : "Verify Email"}
    </h2>

    <p className="subtitle">
      {step === 1
        ? "Register your shop and start selling today."
        : `Enter the OTP sent to ${email}`}
    </p>

    {step === 1 ? (
      <form onSubmit={handleSignUp}>
        <input className="input-field" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
        <input className="input-field" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="input-field" placeholder="Phone Number (+91...)" value={phone} onChange={e => setPhone(e.target.value)} required />
        <input className="input-field" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="gold-btn">Send OTP</button>
      </form>
    ) : (
      <form onSubmit={handleVerifyOtp}>
        <input className="input-field" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required />
        <button type="submit" className="gold-btn">Verify & Create Account</button>
      </form>
    )}

    {message && <div className="message">{message}</div>}

    <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#777" }}>
      Already have an account?{" "}
      <Link to="/login" className="link-text">Login</Link>
    </p>

  </div>
</div>
    
    </>
  );
}

export default Register;