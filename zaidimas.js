console.log("Script loaded successfully");
const boxesContainer = document.querySelector(".grid");
const startButton = document.querySelector(".start-button");
const retryButton = document.querySelector(".retry-button");
const nameInputDiv = document.querySelector(".name-input");
const submitButton = document.querySelector(".submit-button");
const nameInput = document.getElementById("name");

// Istrina duomenis is local storage
// localStorage.clear();

let leaderboard = document.querySelector(".leaderboard table");

// Gauti duomenis is local storage
let names = JSON.parse(localStorage.getItem('names')) || [];
let times = JSON.parse(localStorage.getItem('times')) || [];
let sortedScores = times.slice().sort(function(a, b){return a-b});

// Iteruoti per duomenis ir atvaizduoti juos lenteleje
for(let i = 0; i < sortedScores.length; i++) {
    let row = leaderboard.insertRow(i + 1);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    cell1.innerHTML = names[times.indexOf(sortedScores[i])];
    cell2.innerHTML = sortedScores[i];
}

let timerInterval;
let startTime;
let elapsedTime = 0;
let formattedTime;

// Pradeti laiko skaiciavima
function timer() {
  startTime = new Date().getTime();
  timerInterval = setInterval(() => {
    let currentTime = new Date().getTime();
    elapsedTime = currentTime - startTime;
    let seconds = Math.floor(elapsedTime / 1000) % 60;
    let minutes = Math.floor(elapsedTime / 1000 / 60) % 60;
    let hours = Math.floor(elapsedTime / 1000 / 60 / 60);

    formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById("timer").innerText = formattedTime;
  }, 1);
}

// Perkrauti laikrodi
function resetTimer() {
  clearInterval(timerInterval);
  elapsedTime = 0;
  document.getElementById("timer").innerText = "00:00:00";
}

// Gauti laika
function getTime() {
  return formattedTime;
}

// Shuflinti masyva
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Sukurti dezes
function createboxes(pairCount) {
  // Sukurti masyva su poromis
  const pairs = [];
  for (let i = 1; i <= pairCount; i++) {
    pairs.push(i, i);
  }

  // Shuflinti masyva randomine tvarka
  const shuffledPairs = shuffleArray(pairs);
  console.log(shuffledPairs);

  // Dabar sukuriam deziu masyva
  const boxes = [];
  for (let i = 0; i < shuffledPairs.length; i++) {
    const box = {
      id: i,
      pair: shuffledPairs[i],
    };
    boxes.push(box);
  }
  console.log(boxes);

  return boxes;
}

let flippedboxes = [];

// Sukurti korteliu HTML
function formboxes(boxes) {
  for (let i = 0; i < boxes.length; i++) {
    const box = document.createElement("div");
    box.classList.add("box");
    box.setAttribute("data-id", boxes[i].id);
    box.setAttribute("data-pair", boxes[i].pair);

    const front = document.createElement("div");
    front.classList.add("front");
    front.textContent = "?";

    const back = document.createElement("div");
    back.classList.add("back");

    const image = document.createElement("img");
    image.src = `imgs/${boxes[i].pair}.jpg`;
    back.appendChild(image);

    box.appendChild(front);
    box.appendChild(back);

    boxesContainer.appendChild(box);
  }
}

submitButton.addEventListener("click", function () {
  if(nameInput.value === "") {
    alert("Įvesk savo vardą");
  } else {
    nameInputDiv.style.display = "none";
    leaderboard.style.display = "none";
    document.querySelector(".timer").style.display = "block";
    document.querySelector(".grid-container").style.display = "flex";
  }
});

let pairCount = 10;
let boxes = createboxes(pairCount);
formboxes(boxes); 
boxesContainer.style.pointerEvents = "none";

// Pradeti zaidima
startButton.addEventListener("click", function () {
  // 1 sekundei parodyti korteles
  const allboxes = document.querySelectorAll(".box");
  for (let i = 0; i < allboxes.length; i++) {
    allboxes[i].classList.add("flipped");
    setTimeout(function () {
      allboxes[i].classList.remove("flipped");
    }, 1000);
  }
  boxesContainer.style.pointerEvents = "auto";

  // Paslepti start-button ir parodyti retry-button
  startButton.style.display = "none";
  retryButton.style.display = "block";

  timer();
});

// Is naujo mygtukas
retryButton.addEventListener("click", function () {
  // Uzversti visas kortas
  const flippedboxes = document.querySelectorAll(".flipped");
  flippedboxes.forEach(function (box) {
      box.classList.remove("flipped");
  });

  // Perkrauti taimeri
  resetTimer();
  timer();

  setTimeout(function() {
    boxes = createboxes(pairCount);
    boxesContainer.innerHTML = "";

    formboxes(boxes);
  }, 500); 
});

boxesContainer.addEventListener("click", function (event) {
  const clickedCard = event.target.closest(".box");
  if (!clickedCard) return;

  // Patikrinti ar paspausta kortele jau yra atversta
  if (clickedCard.classList.contains("flipped")) return;
  // Atverti paspausta kortele
  clickedCard.classList.add("flipped");

  // Prideti paspausta kortele i flippedboxes masyva
  flippedboxes.push(clickedCard);

  // Jei turime 2 atvertas kortas patikrinti ar jos sutampa
  if (flippedboxes.length === 2) {
    const card1 = flippedboxes[0];
    const card2 = flippedboxes[1];

    // Patikrinti ar dezes sutampa
    if (card1.dataset.pair === card2.dataset.pair) {
      // Dezer sutampa
      card1.classList.add("matched");
      card2.classList.add("matched");
    } else {
      // Dezes nesutampa
      setTimeout(function () {
        card1.classList.remove("flipped");
        card2.classList.remove("flipped");
      }, 300);

      // Uzblokuoti deziu paspaudima kol jos atverciamos atgal
      boxesContainer.style.pointerEvents = "none";
      setTimeout(function () {
        boxesContainer.style.pointerEvents = "auto";
      }, 300);
    }

    // Isvalyti flippedboxes masyva
    flippedboxes = [];
  }

  // Jeigu zaidimas baigtas
  if (isGameOver()) {
    // Sustabdyti laikrodi
    clearInterval(timerInterval);

    // Issaugoti rezultatus
    let names = JSON.parse(localStorage.getItem('names')) || [];
    let times = JSON.parse(localStorage.getItem('times')) || [];
    let name = nameInput.value; 
    let time = getTime();
    names.push(name); 
    times.push(time);
    
    localStorage.setItem("names", JSON.stringify(names));
    localStorage.setItem("times", JSON.stringify(times));
    
    setTimeout(function () {
      alert(`Laimejai! Tavo laikas yra ${getTime()}`);

      // Perkrauti puslapi
      location.reload();
    }, 300);
  }
});

// Patikrinti ar zaidimas baigtas
function isGameOver() {
  const matchedboxes = document.querySelectorAll(".matched");
  if (matchedboxes.length === boxes.length) {
    return true;
  } else {
    return false;
  }
}