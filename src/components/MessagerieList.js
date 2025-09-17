// src/pages/MessagerieList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import logo from '../images/logo.png';

const MessagerieList = ({ currentUserId }) => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/api/messages");
        setConversations(res.data);
      } catch (err) {
        console.error("Erreur chargement conversations :", err);
      }
    };

    if (currentUserId) fetchConversations();
  }, [currentUserId]);

  // Grouper par utilisateur
  const grouped = conversations.reduce((acc, msg) => {
    const otherId = msg.sender._id === currentUserId ? msg.receiver._id : msg.sender._id;
    const otherUser = msg.sender._id === currentUserId ? msg.receiver : msg.sender;

    if (!acc[otherId]) {
      acc[otherId] = {
        userId: otherId,
        user: otherUser,
        lastMessage: msg,
        unread: msg.receiver._id === currentUserId && !msg.lu,
      };
    }
    return acc;
  }, {});

  const sorted = Object.values(grouped).sort(
    (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header - Aligné à gauche */}
      <header className="bg-white border-b px-6 py-4 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="text-[#16A14A] hover:text-green-700 text-xl"
          aria-label="Retour"
        >
          ←
        </button>
        <img src={logo} alt="Logo" className="h-8" />
<h1 className="w-full text-lg text-center font-semibold text-gray-800">
  Messagerie
</h1>
      </header>


      {/* Contenu central - Liste centrée */}
      <main className="flex-1 bg-gray-50  px-4 py-6">
        <div className="max-w-lg mx-auto">
          {sorted.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">📭 Aucune conversation</p>
              <p className="text-sm text-gray-400 mt-1">Commencez une discussion avec un créateur.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((conv) => (
                <div
                  key={conv.userId}
                  onClick={() => navigate(`/messagerie/${conv.userId}`)}
                  className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 border border-gray-100 hover:shadow transition cursor-pointer"
                >
                  {/* Photo + Point vert */}
                  <div className="relative">
                    <img
                      src={conv.user.photo ? `https://backend-hqhy.onrender.com${conv.user.photo}` : "/default-avatar.png"}
                      alt={conv.user.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    {/* Point vert pour "non lu" */}
                    {conv.unread && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#16A14A] rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {conv.user.name} {conv.user.prenom}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p
                        className={`text-sm truncate ${
                          conv.unread ? "font-medium text-gray-700" : "text-gray-500"
                        }`}
                      >
                        <span className="font-medium">
                          {conv.lastMessage.sender._id === currentUserId ? "Vous" : "💬"}
                        </span>{" "}
                        {conv.lastMessage.content}
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer - centré, bas de page */}
      <footer className="bg-white border-t px-4 py-2 text-center">
        <p className="text-xs text-gray-500">
          OpenUp © {new Date().getFullYear()} — Plateforme d’échange non monétaire
        </p>
      </footer>
    </div>
  );
};

export default MessagerieList;