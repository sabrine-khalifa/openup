// src/pages/Messagerie.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
//import logo from '../images/logo.png';

const Messagerie = ({ currentUserId }) => {
  const { otherId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const navigate = useNavigate();

  // Charger les messages
  useEffect(() => {
    if (!otherId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/messages/${otherId}`);
        setMessages(res.data);

        if (res.data.length > 0) {
          const msg = res.data[0];
          const user = msg.sender._id === currentUserId ? msg.receiver : msg.sender;
          setOtherUser(user);
        }
      } catch (err) {
        console.error("Erreur chargement messages :", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [otherId, currentUserId]);

  // Envoyer un message
  const sendMessage = async () => {
    if (!text.trim() || !otherId) return;
    try {
      const res = await api.post("/api/messages", {
        receiverId: otherId,
        content: text,
      });
      setMessages((prev) => [...prev, res.data.message]);
      setText("");
    } catch (err) {
      console.error("Erreur envoi message :", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="text-[#16A14A] hover:text-green-700 text-xl"
          aria-label="Retour"
        >
          ←
        </button>
        { /* <img src={logo} alt="Logo" className="h-8" /> */}
        <h1 className=" w-full text-center text-lg font-semibold text-gray-800">Messagerie</h1>
      </header>

      {/* Chat */}
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        {otherUser ? (
          <div className="max-w-lg mx-auto">
            {/* En-tête conversation */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-white rounded-xl shadow-sm border">
              <img
                src={otherUser.photo ? otherUser.photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=16A14A&color=fff&size=60`}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover border"
              />
              <div>
                <p className="font-semibold text-gray-800">
                  {otherUser.name} {otherUser.prenom}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  En ligne
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3 mb-2">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-4 bg-white rounded-xl">
                  Aucun message pour l’instant
                </p>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender._id === currentUserId;
                  const sender = msg.sender;

                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-2 ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Photo (uniquement pour l'autre utilisateur) */}
                      {!isMe && (
                        <img
                          src={sender.photo ? `https://backend-hqhy.onrender.com${sender.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.name)}&background=16A14A&color=fff&size=60`}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}

                      {/* Bulle de message - TOUS EN BLANC */}
                      <div
                        className={`px-4 py-2 rounded-2xl text-sm max-w-xs ${
                          isMe
                            ? "bg-white text-gray-800 rounded-tr-none shadow border-l-4 border-[#16A14A]"
                            : "bg-white text-gray-800 rounded-tl-none shadow"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p
                          className={`text-xs mt-1 text-right ${
                            isMe ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Chargement...</p>
        )}
      </main>

      {/* Barre d'envoi */}
      {otherUser && (
        <div className="bg-white border-t p-3">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <button
              className="text-gray-500 hover:text-[#16A14A] transition"
              aria-label="Joindre un fichier"
            >
              📎
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Écrire un message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
            />
            <button
              onClick={sendMessage}
              className="bg-[#16A14A] hover:bg-[#1a9d53] text-white rounded-full p-2 transition"
              aria-label="Envoyer"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t px-4 py-2 text-center">
        <p className="text-xs text-gray-500">
          OpenUp © {new Date().getFullYear()} — Plateforme d’échange non monétaire
        </p>
      </footer>
    </div>
  );
};

export default Messagerie;