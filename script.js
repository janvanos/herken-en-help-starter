// Elementen van de pagina ophalen
const labelTekst = document.querySelector("#label");
const startKnop = document.querySelector("#start");
const upload = document.querySelector("#upload");
const foto = document.querySelector("#foto");

let model;
let webcam;
let webcamAan = false;

// Het model laden zodra de pagina opent
async function laadModel() {
  labelTekst.textContent = "Model laden...";
  model = await tmImage.load("model/model.json", "model/metadata.json");
  labelTekst.textContent = "Klaar! Start de webcam of upload een foto.";
}

laadModel();

// De webcam starten
startKnop.addEventListener("click", startWebcam);

async function startWebcam() {
  if (!model) return;                       // model nog niet geladen
  webcam = new tmImage.Webcam(400, 400, true);
  await webcam.setup();                     // vraagt toestemming
  await webcam.play();
  const plek = document.querySelector("#webcam");
  plek.innerHTML = "";                      // oude webcam weghalen
  plek.appendChild(webcam.canvas);
  webcamAan = true;
  window.requestAnimationFrame(loop);
}

// Steeds opnieuw herkennen, net als draw() in p5.js
async function loop() {
  if (!webcamAan) return;
  webcam.update();
  const resultaten = await model.predict(webcam.canvas);
  kiesEnToon(resultaten);
  window.requestAnimationFrame(loop);
}

// Het beste resultaat kiezen en tonen
function kiesEnToon(resultaten) {
  let beste = resultaten[0];
  for (const r of resultaten) {
    if (r.probability > beste.probability) {
      beste = r;
    }
  }
toonResultaat(beste.className, beste.probability);
}

// Het resultaat tonen, met twijfel
function toonResultaat(label, zekerheid) {
  if (zekerheid < 0.7) {
    labelTekst.textContent = "Ik weet het niet zeker";
  } else {
    const procent = Math.round(zekerheid * 100);
    labelTekst.textContent = label + " (" + procent + "%)";
  }
}

// Een foto uploaden
upload.addEventListener("change", fotoGekozen);

function fotoGekozen() {
  if (webcamAan) {          // webcam uitzetten als die aan staat
    webcam.stop();
    webcamAan = false;
  }
  foto.src = URL.createObjectURL(upload.files[0]);
}

// Pas als de foto geladen is, gaat hij naar het model
foto.addEventListener("load", async () => {
  const resultaten = await model.predict(foto);
  kiesEnToon(resultaten);
});