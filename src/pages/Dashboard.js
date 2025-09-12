// pages/Dashboard.jsx
import React from 'react';
import Header from "../components/Header";
import ServiceList from '../pages/ServiceList';
import Footer from "../components/Footer"; // Importe le footer

const Dashboard = () => {
  const userData = JSON.parse(localStorage.getItem("user"));

  if (!userData) return <p>Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Bienvenue, {userData.name} 👋
          </h1>
          <p className="text-gray-600">
            Découvrez les talents de notre communauté d’échange non monétaire.
          </p>
        </div>

        <ServiceList />
      </main>
            <Footer /> {/* Ajoute le footer ici */}

    </div>
  );
};

export default Dashboard;