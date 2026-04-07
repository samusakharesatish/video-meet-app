import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const { addToUserHistory } = useContext(AuthContext);

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) return;
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* 🔵 NAVBAR */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        
        <h2 className="text-xl font-semibold text-gray-800">
          Your Video Call
        </h2>

        <div className="flex items-center gap-6">

          {/* History */}
          <div
            onClick={() => navigate("/history")}
            className="flex items-center gap-1 cursor-pointer text-gray-700 hover:text-blue-600"
          >
            <span className="text-lg">⏳</span>
            <p>History</p>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>

        </div>
      </div>

      {/* 🟢 MAIN SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-16 px-10 py-16 max-w-6xl mx-auto">

        {/* LEFT PANEL */}
        <div className="max-w-xl space-y-6">

          <h2 className="text-3xl font-bold text-gray-800 leading-snug">
            Providing Quality Video Call Just Like Quality Education
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">

            <input
              type="text"
              placeholder="Enter Meeting Code"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              className="
                px-4 py-2 
                border 
                rounded-lg 
                w-full 
                bg-white 
                text-black            /* ✅ FIX */
                placeholder-gray-500  /* ✅ FIX */
                focus:outline-none 
                focus:ring-2 
                focus:ring-blue-500
              "
            />

            <button
              onClick={handleJoinVideoCall}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Join
            </button>

          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="mt-10 md:mt-0">
          <img
            src="/logo3.png"
            alt="video call"
            className="w-[350px] md:w-[450px]"
          />
        </div>

      </div>
    </div>
  );
}

export default withAuth(HomeComponent);