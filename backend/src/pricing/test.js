// On importe votre fonction depuis le fichier voisin
const calculer_devis = require('./calculer_devis');

console.log("🚀 DÉMARRAGE DU JEU DE TESTS...\n");

// Test 1: Simple (Lyon -> Annecy, 53 pers, juillet)
console.log("=== TEST 1 : Cas Simple (+15% saison) ===");
const test1 = calculer_devis({ distance_km: 140, date_depart: "15 juillet 2026", jours_avant_depart: 45, nb_passagers: 53 });
console.log(test1);
console.log("\n-----------------------------------\n");

// Test 2: Urgent (Demande aujourd'hui, départ dans 3 jours)
console.log("=== TEST 2 : Cas Urgent (+10% urgence) ===");
const test2 = calculer_devis({ distance_km: 100, date_depart: "01 octobre 2026", jours_avant_depart: 3, nb_passagers: 30 });
console.log(test2);
console.log("\n-----------------------------------\n");

// Test 3: Capacité (64 passagers)[cite: 1]
console.log("=== TEST 3 : Cas Capacité (+20% capacité) ===");
const test3 = calculer_devis({ distance_km: 50, date_depart: "10 octobre 2026", jours_avant_depart: 40, nb_passagers: 64 });
console.log(test3);
console.log("\n-----------------------------------\n");

// Test 4: Limite Basse (0 passager)[cite: 1]
console.log("=== TEST 4 : Limite Basse (Attendu : Erreur) ===");
const test4 = calculer_devis({ distance_km: 50, date_depart: "10 octobre", jours_avant_depart: 40, nb_passagers: 0 });
console.log(test4);
console.log("\n-----------------------------------\n");

// Test 5: Limite Haute (90 passagers)[cite: 1]
console.log("=== TEST 5 : Limite Haute (Attendu : Escalade HITL) ===");
const test5 = calculer_devis({ distance_km: 50, date_depart: "10 octobre", jours_avant_depart: 40, nb_passagers: 90 });
console.log(test5);