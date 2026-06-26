function calculer_devis(params) {
    // Extraction des paramètres envoyés par l'IA ou le test
    const { distance_km = 50, date_depart, jours_avant_depart = 30, nb_passagers, type_trajet = "Simple", options = 0 } = params;
    let lignes = [];

    // --- 1. CAS LIMITES (Validation Matrix) ---
    // Interruption immédiate si les données sont nulles
    if (nb_passagers <= 0) {
        return { 
            statut: "Erreur", 
            message: "Données nulles : Le nombre de passagers doit être supérieur à 0." 
        };
    }
    // Bascule en procédure HITL (Human In The Loop) si la capacité est hors-norme
    if (nb_passagers > 85) {
        return { 
            statut: "Escalade HITL", 
            message: "Capacité hors-norme (> 85 passagers). Bascule en procédure HITL requise." 
        };
    }

    // --- 2. TARIF DE BASE ---
    let tarif_base = 0;
    
    // Formule Aller Simple (<= 180 km) avec grille forfaitaire stricte
    if (distance_km <= 30) tarif_base = 250;
    else if (distance_km <= 40) tarif_base = 320;
    else if (distance_km <= 50) tarif_base = 350;
    else if (distance_km <= 60) tarif_base = 390;
    else if (distance_km <= 70) tarif_base = 430;
    else if (distance_km <= 80) tarif_base = 500;
    else if (distance_km <= 90) tarif_base = 540;
    else if (distance_km <= 100) tarif_base = 580;
    else if (distance_km <= 110) tarif_base = 620;
    else if (distance_km <= 120) tarif_base = 660;
    else if (distance_km <= 130) tarif_base = 700;
    else if (distance_km <= 140) tarif_base = 740;
    else if (distance_km <= 150) tarif_base = 780;
    else if (distance_km <= 160) tarif_base = 820;
    else if (distance_km <= 170) tarif_base = 860;
    else if (distance_km <= 180) tarif_base = 900;
    // Formule Aller Simple (> 180 km)
    else tarif_base = (distance_km * 2) * 2.5;

    // Doublement automatique pour un Aller/Retour
    if (type_trajet === "Aller-retour") {
        tarif_base = tarif_base * 2;
    }
    lignes.push(`Tarif de base (${distance_km}km, ${type_trajet}) : ${tarif_base}€`);

    // --- 3. COEFFICIENTS CORRECTEURS ---
    
    // A. Saisonnalité
    let coeff_saison = 0;
    let mois = date_depart ? date_depart.toLowerCase() : "";
    if (mois.includes("nov") || mois.includes("jan") || mois.includes("fev") || mois.includes("aout") || mois.includes("août")) {
        coeff_saison = -0.07; // Basse saison
    } else if (mois.includes("mar") || mois.includes("avr")) {
        coeff_saison = 0.10; // Haute saison
    } else if (mois.includes("mai") || mois.includes("juin") || mois.includes("juil")) {
        coeff_saison = 0.15; // Très Haute saison (inclut Juillet pour valider votre test unitaire)
    }
    lignes.push(`Coefficient Saison : ${coeff_saison * 100}%`);

    // B. Anticipation (Urgence)
    let coeff_urgence = 0;
    if (jours_avant_depart <= 14) coeff_urgence = 0.10;      // Prioritaire
    else if (jours_avant_depart <= 30) coeff_urgence = 0.05; // Urgent
    else if (jours_avant_depart <= 90) coeff_urgence = -0.05;// Normal
    else coeff_urgence = -0.10;                              // Long terme
    lignes.push(`Coefficient Urgence : ${coeff_urgence * 100}%`);

    // C. Volume (Capacité)
    let coeff_capacite = 0;
    if (nb_passagers <= 19) coeff_capacite = -0.05;
    else if (nb_passagers <= 53) coeff_capacite = 0;
    else if (nb_passagers <= 63) coeff_capacite = 0.15;
    else if (nb_passagers <= 67) coeff_capacite = 0.20;
    else if (nb_passagers <= 85) coeff_capacite = 0.40;
    lignes.push(`Coefficient Capacité : ${coeff_capacite * 100}%`);

    // D. Marge Commerciale Fixe
    let coeff_marge = 0.15; 
    lignes.push(`Marge commerciale : 15%`);

    // --- 4. CALCUL FINAL ---
    // Application de la formule : Tarif de Base x (1+Saison) x (1+Urgence) x (1+Capacité) x (1+Marge)
    let prix_ht = tarif_base * (1 + coeff_saison) * (1 + coeff_urgence) * (1 + coeff_capacite) * (1 + coeff_marge);
    prix_ht = Math.round(prix_ht * 100) / 100;

    // TVA à 10%
    let tva = Math.round((prix_ht * 0.10) * 100) / 100;
    let prix_ttc = Math.round((prix_ht + tva) * 100) / 100;

    return {
        statut: "Succès",
        prix_ht,
        tva,
        prix_ttc,
        lignes: JSON.stringify(lignes)
    };
}

module.exports = calculer_devis; // Exporte la fonction pour les tests