import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FloatingAIButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/chat")}
      className="fixed bottom-6 right-6 z-50 group"
    >
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-indigo-500 blur-xl opacity-30 group-hover:opacity-50 transition" />

        {/* Button */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:scale-110 transition">
          <MessageCircle className="w-6 h-6" />
        </div>
      </div>
    </button>
  );
}