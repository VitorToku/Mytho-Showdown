const CARD_DATABASE = [
    { id: 1, name: "Zeus", element: "ar", attack: 95, icon: "⚡" },
    { id: 2, name: "Poseidon", element: "agua", attack: 90, icon: "🔱" },
    { id: 3, name: "Hades", element: "terra", attack: 88, icon: "💀" },
    { id: 4, name: "Ares", element: "fogo", attack: 85, icon: "⚔️" },
    { id: 5, name: "Atena", element: "ar", attack: 82, icon: "🦉" },
    { id: 6, name: "Apolo", element: "fogo", attack: 80, icon: "☀️" },
    { id: 7, name: "Ártemis", element: "terra", attack: 78, icon: "🏹" },
    { id: 8, name: "Hefesto", element: "fogo", attack: 75, icon: "🔨" },
    { id: 9, name: "Hermes", element: "ar", attack: 72, icon: "👟" },
    { id: 10, name: "Deméter", element: "terra", attack: 70, icon: "🌾" },
    { id: 11, name: "Dionísio", element: "agua", attack: 68, icon: "🍷" },
    { id: 12, name: "Afrodite", element: "agua", attack: 65, icon: "🐚" },
    { id: 13, name: "Tritão", element: "agua", attack: 60, icon: "🧜‍♂️" },
    { id: 14, name: "Fênix", element: "fogo", attack: 92, icon: "🔥" },
    { id: 15, name: "Satirro", element: "terra", attack: 55, icon: "🐐" },
    { id: 16, name: "Pégaso", element: "ar", attack: 77, icon: "🦄" },
    { id: 17, name: "Medusa", element: "terra", attack: 84, icon: "🐍" },
    { id: 18, name: "Cérbero", element: "fogo", attack: 86, icon: "🐕" },
    { id: 19, name: "Quimera", element: "fogo", attack: 79, icon: "🦁" },
    { id: 20, name: "Gaia", element: "terra", attack: 94, icon: "🌍" },
    { id: 21, name: "Urano", element: "ar", attack: 96, icon: "🌌" },
    { id: 22, name: "Cronos", element: "terra", attack: 98, icon: "⏳" },
    { id: 23, name: "Reia", element: "terra", attack: 85, icon: "🏔️" },
    { id: 24, name: "Prometeu", element: "fogo", attack: 83, icon: "🔥" },
    { id: 25, name: "Pandora", element: "ar", attack: 62, icon: "📦" }
];

const MODIFIERS = [
    { text: "Fogo: Ataque x1.5", element: "fogo", multiplier: 1.5, add: 0 },
    { text: "Água: Ataque x1.5", element: "agua", multiplier: 1.5, add: 0 },
    { text: "Terra: Ataque x1.5", element: "terra", multiplier: 1.5, add: 0 },
    { text: "Ar: Ataque x1.5", element: "ar", multiplier: 1.5, add: 0 },
    { text: "Bônus +20 em Fogo", element: "fogo", multiplier: 1, add: 20 },
    { text: "Bônus +20 em Água", element: "agua", multiplier: 1, add: 20 },
    { text: "Bônus +20 em Terra", element: "terra", multiplier: 1, add: 20 },
    { text: "Bônus +20 em Ar", element: "ar", multiplier: 1, add: 20 },
    { text: "Sinergia Fogo + Fogo: x2.0", type: "combo", combo: ["fogo", "fogo"], multiplier: 2, element: "fogo" },
    { text: "Sinergia Ar + Ar: x2.0", type: "combo", combo: ["ar", "ar"], multiplier: 2, element: "ar" },
    { text: "Aliança Fogo + Terra: +40", type: "combo", combo: ["fogo", "terra"], add: 40, element: "all" },
    { text: "Clã das Águas: 3x Água = x3.0", type: "combo", combo: ["agua", "agua", "agua"], multiplier: 3, element: "agua" },
    { text: "Tornado: Ar + Água = +30", type: "combo", combo: ["ar", "agua"], add: 30, element: "all" }
];

let gameState = {
    playerHand: [],
    opponentHand: [],
    playerField: [],
    opponentField: [],
    playerFieldTotal: 0,
    opponentFieldTotal: 0,
    currentTurn: 1,
    activeModifiers: [],
    turnHistory: [],
    turnMultipliers: [1, 1.5, 2],
    isRevealing: false
};

// --- CORE LOGIC ---

function initGame() {
    gameState = {
        playerHand: getRandomCards(5),
        opponentHand: getRandomCards(5),
        playerField: [],
        opponentField: [],
        playerFieldTotal: 0,
        opponentFieldTotal: 0,
        currentTurn: 1,
        activeModifiers: [],
        turnHistory: [],
        turnMultipliers: [1, 1.5, 2],
        isRevealing: false
    };

    // Clear zones on restart
    document.getElementById("player-card-slot").innerHTML = "";
    document.getElementById("opponent-card-slot").innerHTML = "";

    // Add first modifier
    addModifier();

    updateUI();
    document.getElementById("result-overlay").classList.add("hidden");
    document.getElementById("game-message").innerText = "Escolha sua carta!";
}

function getRandomCards(count) {
    const shuffled = [...CARD_DATABASE].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function addModifier() {
    const randomMod = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    gameState.activeModifiers.push(randomMod);
}

function calculateAttack(card, fieldCards) {
    let finalAttack = card.attack;
    // Current card + cards already on side
    const currentElements = [...fieldCards.map(c => c.element), card.element];

    gameState.activeModifiers.forEach(mod => {
        let applies = false;

        if (mod.type === "combo") {
            // Count elements needed for combo
            const reqMap = {};
            mod.combo.forEach(e => reqMap[e] = (reqMap[e] || 0) + 1);

            applies = Object.keys(reqMap).every(el => {
                const count = currentElements.filter(e => e === el).length;
                return count >= reqMap[el];
            });

            // Only boost if card participates in combo OR mod is "all" 
            if (applies && mod.element !== "all" && card.element !== mod.element) {
                applies = false;
            }
        } else if (mod.element === card.element || mod.element === "all") {
            applies = true;
        }

        if (applies) {
            finalAttack = (finalAttack * (mod.multiplier || 1)) + (mod.add || 0);
        }
    });

    return Math.round(finalAttack);
}

// --- UI UPDATES ---

function updateUI() {
    // Scores - Sync with state totals
    document.getElementById("score-player").innerText = gameState.playerFieldTotal;
    document.getElementById("score-opp").innerText = gameState.opponentFieldTotal;
    document.getElementById("current-turn").innerText = gameState.currentTurn;

    // Modifiers List
    const modContent = document.getElementById("modifier-content");
    modContent.innerHTML = "";

    gameState.activeModifiers.forEach(mod => {
        const modItem = document.createElement("div");
        modItem.className = `modifier-item mod-${mod.element}`;
        modItem.innerHTML = `
            <span>${getElementEmoji(mod.element)}</span>
            <span>${mod.text}</span>
        `;
        modContent.appendChild(modItem);
    });

    // Turn History
    const historyEl = document.getElementById("turn-history-list");
    if (historyEl) {
        historyEl.innerHTML = "";
        gameState.turnHistory.forEach((res, i) => {
            const li = document.createElement("div");
            li.className = "history-item";
            const mult = gameState.turnMultipliers[i];
            li.innerHTML = `T${i + 1} (x${mult}): <span class="winner-${res.winner}">${res.pScore} vs ${res.oScore}</span>`;
            historyEl.appendChild(li);
        });
    }

    // Player Hand
    const handEl = document.getElementById("player-hand");
    handEl.innerHTML = "";
    gameState.playerHand.forEach((card, index) => {
        if (!card) return;
        const cardEl = createCardElement(card, index);
        handEl.appendChild(cardEl);
    });

    // Opponent Hand (Visual only)
    const oppHandEl = document.getElementById("opponent-hand");
    oppHandEl.innerHTML = "";
    for (let i = 0; i < gameState.opponentHand.length; i++) {
        if (gameState.opponentHand[i]) {
            const back = document.createElement("div");
            back.className = "card-back-small";
            oppHandEl.appendChild(back);
        }
    }
}

function getElementEmoji(element) {
    switch (element) {
        case "fogo": return "🔥";
        case "agua": return "💧";
        case "terra": return "🌿";
        case "ar": return "🌪️";
        default: return "✨";
    }
}

function createCardElement(card, index) {
    const div = document.createElement("div");
    div.className = `card ${card.element}`;
    div.dataset.index = index;
    if (index !== -1) {
        div.style.setProperty('--i', index);
    }

    const displayAttack = card.attack; // Always show base attack initially

    div.innerHTML = `
        <div class="card-inner">
            <div class="card-header">
                <span class="card-name">${card.name}</span>
                <span class="card-element-icon">${getElementEmoji(card.element)}</span>
            </div>
            <div class="card-image" style="background-image: url('https://api.dicebear.com/7.x/initials/svg?seed=${card.name}&backgroundColor=2c3e50')">
                <div style="font-size: 40px;">${card.icon}</div>
            </div>
            <div class="card-footer">
                <span class="card-attack-label">Ataque:</span>
                <span class="card-attack-value">${displayAttack}</span>
            </div>
        </div>
    `;

    // Only add click handler for cards in hand
    if (index !== -1) {
        div.onclick = () => playTurn(index);
    }

    return div;
}

// --- GAME ACTIONS ---

function playTurn(cardIndex) {
    if (gameState.isRevealing) return;

    gameState.isRevealing = true;
    const playerCard = gameState.playerHand[cardIndex];

    // Choose opponent card (randomly from hand)
    const validOpponentIndices = gameState.opponentHand.map((c, i) => c ? i : -1).filter(i => i !== -1);
    const oppIdx = validOpponentIndices[Math.floor(Math.random() * validOpponentIndices.length)];
    const opponentCard = gameState.opponentHand[oppIdx];

    // Remove from hands
    gameState.playerHand[cardIndex] = null;
    gameState.opponentHand[oppIdx] = null;

    // UI: Show played cards
    const pZone = document.getElementById("player-card-slot");
    const oZone = document.getElementById("opponent-card-slot");

    // We no longer clear info or hide everything here per turnover logic

    const pCardEl = createCardElement(playerCard, -1); // Base attack in hand
    pCardEl.classList.add("play-anim-player");
    pCardEl.id = `player-card-t${gameState.currentTurn}`;
    pCardEl.style.position = "relative";
    pZone.appendChild(pCardEl);

    document.getElementById("game-message").innerText = "Simultâneo!";

    const oCardEl = document.createElement("div");
    oCardEl.className = "card card-back play-anim-opp";
    oCardEl.style.background = "linear-gradient(45deg, #2c3e50, #000)";
    oCardEl.style.border = "2px solid var(--gold)";
    oCardEl.innerHTML = "<div style='height:100%; display:flex; align-items:center; justify-content:center; font-size:40px'>?</div>";
    oZone.appendChild(oCardEl);

    // Reveal after delay
    setTimeout(() => {
        revealCards(playerCard, opponentCard, oZone);
    }, 1200);
}

function revealCards(pCard, oCard, oZone) {
    const placeholders = oZone.querySelectorAll('.card-back');
    placeholders.forEach(p => p.remove());

    const revealedOppCard = createCardElement(oCard, -1); // Show base initially
    revealedOppCard.id = `opp-card-t${gameState.currentTurn}`;
    revealedOppCard.style.position = "relative";
    oZone.appendChild(revealedOppCard);

    document.getElementById("game-message").innerText = "Aplicando Modificadores...";

    // Visual effect delay
    setTimeout(() => {
        applyModifiersAnimation(pCard, oCard);
    }, 1000);
}

function applyModifiersAnimation(pCard, oCard) {
    const pAtkVal = calculateAttack(pCard, gameState.playerField);
    const oAtkVal = calculateAttack(oCard, gameState.opponentField);

    const pCardEl = document.getElementById(`player-card-t${gameState.currentTurn}`);
    const oCardEl = document.getElementById(`opp-card-t${gameState.currentTurn}`);

    // Update state objects (store played cards)
    gameState.playerField.push(pCard);
    gameState.opponentField.push(oCard);
    updateAtkWithAnim(pCardEl, pAtkVal);
    updateAtkWithAnim(oCardEl, oAtkVal);

    setTimeout(() => {
        finishTurn(pAtkVal, oAtkVal);
    }, 1000);
}

function updateAtkWithAnim(cardEl, newVal) {
    const valEl = cardEl.querySelector('.card-attack-value');
    valEl.classList.add('atk-updating');
    valEl.innerText = newVal;

    // Add glowing effect to card temporarily
    cardEl.classList.add('card-power-up');
    setTimeout(() => {
        valEl.classList.remove('atk-updating');
        cardEl.classList.remove('card-power-up');
    }, 800);
}

function finishTurn(pAtk, oAtk) {
    const multiplier = gameState.turnMultipliers[gameState.currentTurn - 1];
    const pWeighted = Math.round(pAtk * multiplier);
    const oWeighted = Math.round(oAtk * multiplier);

    // Sum weighted totals
    gameState.playerFieldTotal += pWeighted;
    gameState.opponentFieldTotal += oWeighted;

    let winner = "";
    if (pAtk > oAtk) winner = "player";
    else if (oAtk > pAtk) winner = "opponent";
    else winner = "draw";

    gameState.turnHistory.push({
        winner: winner,
        pScore: pWeighted,
        oScore: oWeighted
    });

    document.getElementById("game-message").innerText =
        winner === "draw" ? "Empate!" : (winner === "player" ? "Vitória no Turno!" : "Derrota no Turno!");

    // Update score markers visually
    document.getElementById("score-player").innerText = gameState.playerFieldTotal;
    document.getElementById("score-opp").innerText = gameState.opponentFieldTotal;

    setTimeout(() => {
        nextTurn();
    }, 1500);
}

function nextTurn() {
    if (gameState.currentTurn < 3) {
        gameState.currentTurn++;
        addModifier();
        gameState.isRevealing = false;
        document.getElementById("game-message").innerText = "Escolha sua carta!";
        // We DO NOT clear the zones here as per user request to keep creatures on field
        updateUI();
    } else {
        endGame();
    }
}

function endGame() {
    const overlay = document.getElementById("result-overlay");
    const title = document.getElementById("result-title");
    const msg = document.getElementById("result-message");
    const summary = document.getElementById("result-summary");

    overlay.classList.remove("hidden");

    let historyHtml = "<h4>RESUMO DAS RODADAS</h4>";
    gameState.turnHistory.forEach((h, i) => {
        historyHtml += `<p>Turno ${i + 1}: Jogador ${h.pScore} | Oponente ${h.oScore}</p>`;
    });
    summary.innerHTML = historyHtml;

    if (gameState.playerFieldTotal > gameState.opponentFieldTotal) {
        title.innerText = "VITÓRIA!";
        msg.innerText = `Placar Olímpico: ${gameState.playerFieldTotal} vs ${gameState.opponentFieldTotal}`;
    } else if (gameState.opponentFieldTotal > gameState.playerFieldTotal) {
        title.innerText = "DERROTA";
        msg.innerText = `Placar Olímpico: ${gameState.playerFieldTotal} vs ${gameState.opponentFieldTotal}`;
    } else {
        title.innerText = "EMPATE";
        msg.innerText = `Equilíbrio Absoluto: ${gameState.playerFieldTotal} vs ${gameState.opponentFieldTotal}`;
    }
}

document.getElementById("restart-btn").onclick = initGame;

// Start!
initGame();
