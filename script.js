let ALL_CARDS;

fetch("O-SWS5.json")
  .then((response) => response.json())
  .then((data) => {
    ALL_CARDS = data; // Hier können Sie mit dem Objekt arbeiten
  })
  .catch((error) => console.error("Fehler:", error));

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let deck = [],
  repeatPool = [],
  knownSet = new Set(),
  pos = 0,
  flipped = false,
  round = 1;

function init() {
  deck = shuffle(ALL_CARDS.map((_, i) => i));
  repeatPool = [];
  knownSet = new Set();
  pos = 0;
  flipped = false;
  round = 1;
  render();
}

function render() {
  const app = document.getElementById("app");

  if (knownSet.size === ALL_CARDS.length) {
    app.innerHTML = `
      <div class="done">
        <div class="done-emoji">🏛️</div>
        <h2>Alle gewusst!</h2>
        <p>Alle ${ALL_CARDS.length} Karten gemeistert.</p>
        <button class="btn-reset" onclick="init()">Neu starten</button>
      </div>`;
    return;
  }

  if (pos >= deck.length) {
    deck = shuffle(repeatPool);
    repeatPool = [];
    pos = 0;
    round++;
    flipped = false;
  }

  const card = ALL_CARDS[deck[pos]];
  const progress = Math.round((knownSet.size / ALL_CARDS.length) * 100);
  const totalLeft = deck.length - pos + repeatPool.length;

  app.innerHTML = `
    <div class="progress-wrap">
      <div class="progress-labels">
        <span>✓ ${knownSet.size} gewusst</span>
        <span>${totalLeft} verbleibend</span>
        <span>✗ ${repeatPool.length} wiederholen</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar" style="width:${progress}%"></div>
      </div>
    </div>

    <div class="round-badge">${round > 1 ? `Wiederholung · Runde ${round}` : "&nbsp;"}</div>

    <div class="scene" id="scene">
      <div class="card" id="card">
        <div class="card-face card-front">
          <div class="latin-word">${card.latin}</div>
          ${card.info ? `<div class="grammar-info">${card.info}</div>` : ""}
          <div class="tap-hint" id="tap-hint">Tippen zum Umdrehen</div>
        </div>
        <div class="card-face card-back">
          <div class="back-latin">${card.latin}</div>
          <div class="german-word">${card.german.replace(/\n/g, "<br>")}</div>
        </div>
      </div>
    </div>

    <div class="button-row">
      <button class="btn btn-nochmal" id="btn-n">✗ Nochmal</button>
      <button class="btn btn-gewusst" id="btn-g">✓ Gewusst</button>
    </div>

    <div class="counter" id="counter">Karte ${pos + 1} von ${deck.length}</div>
  `;

  document.getElementById("scene").addEventListener("click", flipCard);
  document.getElementById("btn-n").addEventListener("click", (e) => {
    e.stopPropagation();
    answer(false);
  });
  document.getElementById("btn-g").addEventListener("click", (e) => {
    e.stopPropagation();
    answer(true);
  });
}

function flipCard() {
  if (flipped) return;
  flipped = true;
  document.getElementById("card").classList.add("flipped");
  document.getElementById("btn-n").classList.add("visible");
  document.getElementById("btn-g").classList.add("visible");
  const hint = document.getElementById("tap-hint");
  if (hint) hint.style.opacity = "0";
}

function answer(correct) {
  if (correct) knownSet.add(deck[pos]);
  else repeatPool.push(deck[pos]);
  pos++;
  flipped = false;
  render();
}

init();
