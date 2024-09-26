const puppeteer = require('puppeteer');
const fs = require('fs');
const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

let callMessages = [];
let bonusMessages = [];
let bountyMessages = [];
let superBountyMessages = [];
let seenMessages = new Set(); // Ensemble pour stocker les messages déjà vus

// Fonction pour surveiller le chat DLive
async function monitorChat() {
    try {
        const browser = await puppeteer.launch({ headless: true }); // Démarrer le navigateur en mode headless
        const page = await browser.newPage();
        await page.goto('https://dlive.tv/c/ZrToxiic/zrtoxiic', { waitUntil: 'domcontentloaded' });

        console.log("Surveillance du chat démarrée...");

        // Surveillance des messages du chat toutes les 5 secondes
        setInterval(async () => {
            try {
                const chatData = await page.evaluate(() => {
                    const messages = document.querySelectorAll('.position-relative.chatrow-inner.text-13-medium');
                    return Array.from(messages).map(message => message.innerText);
                });

                chatData.forEach(msg => {
                    if (!seenMessages.has(msg)) {
                        seenMessages.add(msg); // Marquer le message comme vu
                        const timestamp = getParisTime(); // Récupérer l'heure dans le fuseau horaire de Paris

                        // Traiter les différentes commandes
                        if (msg.includes('!call')) {
                            callMessages.push({ timestamp, message: msg });
                        } else if (msg.includes('!bonus')) {
                            bonusMessages.push({ timestamp, message: msg });
                        } else if (msg.includes('!bounty')) {
                            bountyMessages.push({ timestamp, message: msg });
                        } else if (msg.includes('!superbounty')) {
                            superBountyMessages.push({ timestamp, message: msg });
                        }

                        console.log(`Nouveau message détecté: ${msg} à ${timestamp}`);
                        saveToHTML(); // Sauvegarder les messages dans le fichier HTML
                    }
                });
            } catch (error) {
                console.error("Erreur lors de la récupération des messages : ", error);
            }
        }, 5000);

    } catch (error) {
        console.error("Erreur lors du chargement de la page DLive : ", error);
    }
}

// Fonction pour obtenir l'heure actuelle au fuseau horaire de Paris
function getParisTime() {
    const now = new Date();
    const parisTime = new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(now);

    return parisTime.replace(',', ''); // Format propre pour affichage
}

// Fonction pour sauvegarder les messages dans un fichier HTML avec un style plus esthétique
function saveToHTML() {
    const outputPath = "C:\\Users\\yannp\\ChatBot\\index.html"; // Enregistrer dans le chemin spécifié
    const outputPath = "C:\\Users\\yannp\\chatbot-nodejs\\index.html";
    let html = `
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Listes des Call et Achats</title>
        <meta http-equiv="refresh" content="10"> <!-- Actualisation automatique toutes les 10 secondes -->
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                margin: 0;
                padding: 20px;
            }
            h1 {
                color: #333;
                text-align: center;
                margin-bottom: 20px;
            }
            ul {
                list-style-type: none;
                padding: 0;
            }
            li {
                margin: 10px 0;
                padding: 15px;
                border-radius: 8px;
                background-color: #fff;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            li strong {
                font-weight: bold;
                color: #2b2b2b;
            }
            .timestamp {
                color: #888;
                font-size: 0.9em;
            }
            .section-title {
                font-size: 1.5em;
                margin-top: 30px;
                color: #444;
            }
        </style>
    </head>
    <body>
        <h1>Listes des Call et Achats</h1>
        
        <h2 class="section-title">Messages '!call'</h2>
        <ul>
    `;

    // Ajout des messages !call
    callMessages.forEach(({ timestamp, message }) => {
        html += `
            <li>
                <span class="message-content"><strong>${message}</strong></span>
                <span class="timestamp">${timestamp}</span>
            </li>\n`;
    });

    // Ajout des messages !bonus
    html += `</ul><h2 class="section-title">Messages '!bonus'</h2><ul>`;
    bonusMessages.forEach(({ timestamp, message }) => {
        html += `
            <li>
                <span class="message-content"><strong>${message}</strong></span>
                <span class="timestamp">${timestamp}</span>
            </li>\n`;
    });

    // Ajout des messages !bounty
    html += `</ul><h2 class="section-title">Messages '!bounty'</h2><ul>`;
    bountyMessages.forEach(({ timestamp, message }) => {
        html += `
            <li>
                <span class="message-content"><strong>${message}</strong></span>
                <span class="timestamp">${timestamp}</span>
            </li>\n`;
    });

    // Ajout des messages !superbounty
    html += `</ul><h2 class="section-title">Messages '!superbounty'</h2><ul>`;
    superBountyMessages.forEach(({ timestamp, message }) => {
        html += `
            <li>
                <span class="message-content"><strong>${message}</strong></span>
                <span class="timestamp">${timestamp}</span>
            </li>\n`;
    });

    html += `
        </ul>
    </body>
    </html>
    `;

    fs.writeFileSync(outputPath, html, 'utf8');
    console.log(`Fichier HTML mis à jour et enregistré dans : ${outputPath}`);
}

// Route pour servir le fichier HTML via Express
app.get('/', (req, res) => {
    const filePath = "C:\\Users\\yannp\\ChatBot\\index.html";
    const filePath = "C:\\Users\\yannp\\chatbot-nodejs\\index.html";
    res.sendFile(filePath);
});

// Démarrer le serveur HTTP
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
    monitorChat(); // Démarrer la surveillance du chat
});
