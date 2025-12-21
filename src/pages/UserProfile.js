// src/pages/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Header from "../components/Header";

const UserProfile = () => {
  const { id } = useParams(); // id du créateur
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [avis, setAvis] = useState([]);
  //const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState("apropos");
  const navigate = useNavigate();

  const categoriesDisponibles = [
    { nom: "Sport", couleur: "#212E53" },
    { nom: "Musique & Son", couleur: "#FFBF66" },
    { nom: "Art", couleur: "#F27438" },
    { nom: "Architecture", couleur: "#E3CD8B" },
    { nom: "Développement Personnel", couleur: "#9B59B6" },
    { nom: "Illustration & Design", couleur: "#e76f51" },
    { nom: "Vidéo & Montage", couleur: "#585B4C" },
    { nom: "Santé", couleur: "#AFA4CE" },
    { nom: "Artisanat", couleur: "#CA7C5C" },
    { nom: "Décoration & Aménagement", couleur: "#C89F9C" },
    { nom: "Formation, Transmission & Accompagnement", couleur: "#C8574D" },
    { nom: "Informatique & Technologies", couleur: "#3498DB" },
  ];

  useEffect(() => {
    api.get(`/api/users/${id}`).then((res) => setUser(res.data));
    api.get(`/api/services/serv/user/${id}`).then((res) => setServices(res.data));
    //api.get(`/api/reservations/user/${id}`).then((res) => setReservations(res.data));
  }, [id]);

  useEffect(() => {
    api.get(`/api/avis/user/${id}`).then((res) => setAvis(res.data));
  }, [id]);

  if (!user) return <p className="text-center py-10">Chargement...</p>;

  // Calcul note moyenne
  const avisAvecNote = avis.filter(a => {
    const n = typeof a.note === 'string' ? parseFloat(a.note) : a.note;
    return typeof n === 'number' && !isNaN(n) && n >= 1 && n <= 5;
  });

  const noteMoyenne = avisAvecNote.length > 0
    ? avisAvecNote.map(a => typeof a.note === 'string' ? parseFloat(a.note) : a.note)
        .reduce((acc, n) => acc + n, 0) / avisAvecNote.length
    : null;

  const noteAffichee = noteMoyenne ? noteMoyenne.toFixed(1) : "Non noté";
  const nombreAvis = avis.length;

  const getCouleurCategorie = (nom) => {
    const cat = categoriesDisponibles.find(c => c.nom === nom);
    return cat ? cat.couleur : "#6b7280";
  };

  const getAuteurPhoto = (auteur) => {
  if (auteur?.photo) {
    return auteur.photo;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(auteur?.name || "User")}&background=6b7280&color=fff&size=64`;
};


  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Retour */}
        <button
          onClick={() => navigate(-1)}
          className="text-[#16A14A] hover:underline mb-6 flex items-center gap-1 text-lg"
        >
          ← Retour
        </button>

        {/* Profil */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col md:flex-row items-start gap-8">
          {/* Photo */}
          <img
            src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=16A14A&color=fff&size=120`}
            alt={user.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-[#16A14A]"
          />

          {/* Infos */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">{user.name} {user.prenom}</h1>
            {user.metier && <p className="text-lg text-gray-600 mt-1">{user.metier}</p>}
            {user.domaine && (
              <span
                style={{ backgroundColor: getCouleurCategorie(user.domaine), color: "white" }}
                className="px-3 py-1 rounded-full text-sm font-medium inline-block mt-2"
              >
                {user.domaine}
              </span>
            )}
            {nombreAvis > 0 && (
              <div className="flex items-center gap-1 mt-3">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm text-gray-600">{noteAffichee} ({nombreAvis} avis)</span>
              </div>
            )}
          </div>

          {/* Bouton contacter */}
          <button
            onClick={() => user._id && navigate(`/messagerie/${user._id}`)}
            className="mt-4 md:mt-0 bg-[#16A14A] hover:bg-[#1a9d53] text-white px-6 py-3 rounded-lg font-medium transition"
          >
            ✉️ Contacter
          </button>
        </div>

        {/* Onglets */}
        <div className="flex flex-wrap gap-6 border-b mb-8">
          <div className="flex gap-6 border-b mb-6">
          <button
            onClick={() => setActiveTab("apropos")}
            className={`pb-2 ${activeTab === "apropos" ? "border-b-2 border-[#16A14A] text-[#16A14A]": ""}`}
          >
            À propos
          </button>
            {user.role !== "particulier" && (

          <button
            onClick={() => setActiveTab("services")}
            className={`pb-2 ${activeTab === "services" ? "border-b-2 border-[#16A14A] text-[#16A14A]" : ""}`}
          >
            Services proposés
          </button>
            )}

        {/* <button
            onClick={() => setActiveTab("reserves")}
            className={`pb-2 ${activeTab === "reserves" ? "border-b-2 border-[#16A14A] text-[#16A14A]" : ""}`}
          >
            Services réservés
          </button>

                  <button
            onClick={() => setActiveTab("portefeuille")}
            className={`pb-2 ${activeTab === "portefeuille" ? "border-b-2 border-[#16A14A] text-[#16A14A]" : ""}`}
          >
            Portefeuille
          </button> */}
          <button
            onClick={() => setActiveTab("avis")}
            className={`pb-2 ${activeTab === "avis" ? "border-b-2 border-[#16A14A] text-[#16A14A]" : ""}`}
          >
            Avis
          </button>
        </div>

        </div>

        {/* Contenu des onglets */}


   {activeTab === "services" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Services proposés</h2>
            {services.length === 0 ? (
              <p className="text-gray-500">Aucun service proposé pour l’instant.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-6">
                {services.map((service) => {

                  const avisDuService = avis.filter(a => a.service?._id === service._id);
                    

                  return (
                    <div
                      key={service._id}
                      className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer p-4"
                      onClick={() => navigate(`/service/${service._id}`)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{service.titre || "Sans titre"}</h3>
                          
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-500 gap-3">
  {/* Position */}
  <span className="flex items-center gap-1">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-8.5 8-14a8 8 0 10-16 0c0 5.5 8 14 8 14z" />
    </svg>
    {service.typePrestation || "Distanciel"} - {service.lieu || "France"}
  </span>

  {/* Durée */}
  <span className="flex items-center gap-1">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
    </svg>
    {service.duree || "1h30"}
  </span>

  {/* Collectif / Individuel */}
  <span className="flex items-center gap-1">
<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>


    {service.typeCours || "Individuel"}
  </span>
</div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="font-semibold text-green-600">{service.creditsProposes} crédits</span>
                        <button className="w-20 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm">Réserver</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      

    {/*   {activeTab === "reserves" && (
  <div>
    <h2 className="text-xl font-semibold mb-4">Services ou créations réservés</h2>
    {reservations.length === 0 ? (
      <p className="text-gray-500">Vous n'avez réservé aucun service pour l'instant.</p>
    ) : (
      <div className="space-y-4">
       {reservations.map(r => {
  const service = r.service;
  const createur = user;
  const categorie = service?.categorie || service?.categories?.[0];

  return (
    <div key={r._id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
      <div>
        <h3 className="font-semibold">{service?.titre || "Sans titre"}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          {categorie && (
            <span
              style={{
                backgroundColor: `${getCouleurCategorie(categorie)}20`,
                color: getCouleurCategorie(categorie),
                border: `1px solid ${getCouleurCategorie(categorie)}`,
              }}
              className="px-2 py-1 rounded-full text-xs font-medium"
            >
              {categorie}
            </span>
          )}
          <span className="flex items-center gap-1">  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
    </svg> {service?.duree || "Non précisé"}</span>
          <span className="flex items-center gap-1"> 
            
 

<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
 {service?.typeCours || "Non précisé"}</span>
          <span>avec {createur?.name} {createur?.prenom}</span>
          <span>le {new Date(r.date).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="text-green-600 font-semibold text-sm">
          {service?.creditsProposes || 0} crédits
        </span>
        <button
          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
          onClick={() => {
            if (createur?._id) {
              navigate(`/messagerie/${createur._id}`);
            } else {
              alert("ID du créateur non disponible");
            }
          }}
        >
          Contacter
        </button>
      </div>
    </div>
  );
})}

      </div>
    )}
  </div>
)}
        {activeTab === "portefeuille" && (
       
         <div>
            <h2 className="text-xl font-semibold mb-4">Mon portefeuille</h2>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-3xl font-bold text-green-600">{user.credits} ⚡</p>
              <p className="text-gray-600">Solde de crédits</p>
            </div>
          </div>
        )}
        */}

        {activeTab === "avis" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Avis reçus</h2>
            {avis.length === 0 ? (
              <p className="text-gray-500">Aucun avis pour ce créateur.</p>
            ) : (
              <div className="space-y-4">
                {avis.map(a => (
                  <div key={a._id} className="bg-white p-4 rounded-xl shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <img
  src={getAuteurPhoto(a.auteur)} 
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />      
                         <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                          <p className="font-medium">
                            {a.auteur?.name} {a.auteur?.prenom}
                          </p>
                           {a.note && (
                          <div className="flex items-center gap-1 text-yellow-500 text-sm">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < a.note ? "★" : "☆"}</span>
                            ))}
                          </div>
                        )}
                        </div>
                          <span className="text-sm text-gray-400">
                            {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>
                       
                     
                    </div>
                    <p className="text-gray-700">{a.commentaire}</p>
                    <p className="text-sm text-gray-500 italic mt-2">Service : {a.service?.titre}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfile;