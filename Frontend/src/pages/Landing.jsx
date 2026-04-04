import "../App.css";
import { Link, useNavigate } from "react-router-dom";

export default function Landing() {

  const navigate = useNavigate();

  // ✅ Join as Guest → go directly to meeting
  const handleGuestJoin = () => {
    const roomId = Math.random().toString(36).substring(2, 8);
    navigate(`/${roomId}`);
  };

  return (
    <div className="LandingPageContainer">

      {/* NAVBAR */}
      <nav>
        <div className="navHeader">
          <h2>Your Video Call</h2>
        </div>

        <div className="navlist">

          {/* ✅ Guest Join */}
          <button onClick={handleGuestJoin} className="nav-btn">
            Join as Guest
          </button>

          {/* ✅ Register */}
          <Link to="/auth" className="nav-btn">
            Register
          </Link>

          {/* ✅ Login */}
          <Link to="/auth" className="nav-btn primary">
            Login
          </Link>

        </div>
      </nav>

      {/* MAIN */}
      <div className="LandingMainContainer">

        <div>
          <h1>
            <span style={{ color: "#FF9839" }}>Connect</span> with your Love Once
          </h1>

          <p>Cover distance by your video call</p>

          {/* ✅ Get Started */}
          <Link
            to="/auth"
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 inline-block mt-4"
          >
            Get Started
          </Link>
        </div>

        <div className="mobile-img">
          <img src="/mobile2.png" alt="mobile" />
        </div>

      </div>
      
    </div>
  );
}