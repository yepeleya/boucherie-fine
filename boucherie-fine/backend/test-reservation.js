// Script de test pour l'API de réservation publique
const fetch = require('node-fetch');

async function testReservation() {
  const testData = {
    nom: "Jean Dupont",
    email: "jean.dupont@example.com",
    telephone: "+33123456789",
    dateReservation: "2025-10-20",
    heureReservation: "19:00",
    nombrePersonnes: 4,
    commentaires: "Test de réservation depuis le script"
  };

  try {
    console.log('🧪 Test de l\'API de réservation publique...');
    console.log('📤 Données envoyées:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3000/api/reservations/public', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Réservation créée avec succès!');
      console.log('📊 Résultat:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Erreur lors de la réservation:');
      console.log('📊 Erreur:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('💥 Erreur de connexion:', error.message);
  }
}

testReservation();