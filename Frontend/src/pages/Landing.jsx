import "../App.css";
import { Link, useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const handleGuestJoin = () => {
    const roomId = Math.random().toString(36).substring(2, 8);
    navigate(`/${roomId}`);
  };

  return (
    <div className="LandingPageContainer">
      {/* 🔥 NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-4">
        <h2 className="font-semibold tracking-wide text-white text-xl">
          <span className="text-red-500">Your </span>
          Video Call
        </h2>

        <div className="navlist text-white flex gap-6 items-center">
          <button onClick={handleGuestJoin} className="nav-btn">
            Join as Guest
          </button>

          <Link to="/auth?type=register" className="nav-btn">
            Register
          </Link>

          <Link to="/auth?type=login" className="nav-btn primary">
            Login
          </Link>
        </div>
      </nav>

      {/* 🔥 MAIN */}
      <div className="flex items-center justify-between max-w-6xl mx-auto px-10 py-16 gap-10">
        {/* LEFT */}
        <div className="flex-1">
          <h1 className="text-5xl font-bold leading-tight text-white">
            <span style={{ color: "#FF9839" }}>Connect</span> with your Loved
            Ones
          </h1>

          <p className="mt-6 text-gray-300 text-lg max-w-md">
            High-quality video calls with zero hassle. Stay close no matter the
            distance.
          </p>

          <Link to="/auth?type=register" className="cta-btn inline-block mt-6">
            🚀 Get Started
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex-1 flex justify-center items-center relative">
          {/* 🔥 Glow Background */}
          <div className="absolute w-[500px] h-[500px] bg-red-500/20 blur-3xl rounded-full"></div>

          {/* 🔥 Image */}
          <img
            src="/mobile2.png"
            alt="mobile"
            className="relative w-[420px] max-w-full object-contain 
               drop-shadow-2xl 
               hover:scale-105 transition duration-500"
          />
        </div>
      </div>
    </div>
  );
}
