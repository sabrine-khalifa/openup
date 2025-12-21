import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [avis, setAvis] = useState([]);
  const [activeTab, setActiveTab] = useState("À propos");

  /* ========================
     Chargement des données
  ========================= */
  useEffect(() => {
    // Profil public (SANS token)
    axios
      .get(`https://backend-hqhy.onrender.com/api/users/public/${userId}`)
      .then(res => setUser(res.data))
      .catch(() => navigate("/404"));

    // Services proposés
    axios
      .get(`https://backend-hqhy.onrender.com/api/services/serv/user/${userId}`)
      .then(res => setServices(res.data))
      .catch(() => setServices([]));

    // Avis reçus
    axios
      .get(`https://backend-hqhy.onrender.com/api/avis/user/${userId}`)
      .then(res => setAvis(res.data))
      .catch(() => setAvis([]));
  }, [userId, navigate]);

  if (!user) {
    return <p className="text-center py-10">Chargement…</p>;
  }

  /* ========================
     Helpers
  ========================= */
  const getAvatar = () => {
    if (user.photo) return user.photo;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${user.prenom} ${user.name}`
    )}&background=16A14A&color=fff&size=120`;
  };

  /* ========================
     RENDER
  ========================= */
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* ===== Carte Profil ===== */}
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center gap-6">
          <img
            src={getAvatar()}
            alt={user.name}
            className="w-32 h-32 rounded-full border-4 border-[#16A14A] object-cover"
          />

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800">
              {user.prenom} {user.name}
            </h1>

            {user.metier && (
              <p className="text-gray-600 mt-1">{user.metier}</p>
            )}

            {user.note && (
              <p className="mt-2 text-sm text-gray-600">
                ⭐ {user.note} ({user.nombreAvis} avis)
              </p>
            )}
          </div>
        </div>

        {/* ===== Onglets ===== */}
        <div className="flex gap-6 border-b mt-10">
          {["À propos", "Services", "Avis"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-medium transition ${
                activeTab === tab
                  ? "border-b-2 border-[#16A14A] text-[#16A14A]"
                  : "text-gray-500 hover:text-[#16A14A]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ===== CONTENU ===== */}

        {/* ===== À propos ===== */}
        {activeTab === "À propos" && (
          <div className="bg-white mt-6 p-6 rounded-xl shadow space-y-4">
            <p className="text-gray-700">
              {user.description || "Aucune description fournie."}
            </p>

            {user.valeurs && (
              <p>
                <strong>Valeurs :</strong> {user.valeurs}
              </p>
            )}

            {/* Liens */}
            <div className="pt-4 border-t space-y-2">
              {user.siteWeb && (
                <a
                  href={user.siteWeb.startsWith("http") ? user.siteWeb : `https://${user.siteWeb}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline"
                >
                  🌐 Site web
                </a>
              )}

              {user.instagram && (
                <a
                  href={user.instagram.startsWith("http") ? user.instagram : `https://${user.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline"
                >
                  📸 Instagram
                </a>
              )}

              {user.linkedin && (
                <a
                  href={user.linkedin.startsWith("http") ? user.linkedin : `https://${user.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline"
                >
                  💼 LinkedIn
                </a>
              )}
            </div>
          </div>
        )}

        {/* ===== Services proposés ===== */}
        {activeTab === "Services" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {services.length === 0 ? (
              <p className="text-gray-500">Aucun service proposé.</p>
            ) : (
              services.map(service => (
                <div
                  key={service._id}
                  className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => navigate(`/service/${service._id}`)}
                >
                  <h3 className="font-bold text-gray-800">
                    {service.titre}
                  </h3>

                  <p className="text-sm text-gray-600 mt-1">
                    {service.typePrestation} • {service.duree || "Durée non précisée"}
                  </p>

                  <p className="mt-3 font-semibold text-[#16A14A]">
                    {service.creditsProposes} crédits
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ===== Avis ===== */}
        {activeTab === "Avis" && (
          <div className="mt-6 space-y-4">
            {avis.length === 0 ? (
              <p className="text-gray-500">Aucun avis pour le moment.</p>
            ) : (
              avis.map(a => (
                <div key={a._id} className="bg-white p-4 rounded-xl shadow">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">
                      {a.auteur?.prenom} {a.auteur?.name}
                    </p>
                    <span className="text-sm text-gray-400">
                      {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  {a.note && (
                    <p className="text-yellow-500">
                      {"★".repeat(a.note)}{"☆".repeat(5 - a.note)}
                    </p>
                  )}

                  <p className="mt-2 text-gray-700">{a.commentaire}</p>

                  {a.service?.titre && (
                    <p className="text-sm text-gray-500 italic mt-1">
                      Service : {a.service.titre}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicProfile;
