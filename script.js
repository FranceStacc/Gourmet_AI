/* ----- Informazioni generali ----- */
const API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = "GEMINI_API_KEY";
let schede_ricette = [];

/* ----- Recupero informazioni dal file css ----- */

const main = document.querySelector("main");
const n_persone = document.querySelector('#cont-pers');
const incr_pers_bott = document.querySelector('#incr-pers');
const decr_pers_bott = document.querySelector('#decr-pers');
const crea_bott = document.querySelector('#crea');
const contieni_ris = document.querySelector('#contieni-ris');
const crea_nuovo_bott = document.querySelector('#crea-nuovo');


/* ----- Elaborazione informazioni ----- */

// Incrementa numero persone al click sul bottone '+'
incr_pers_bott.addEventListener('click', function() {
    n_persone.innerText = Number(n_persone.innerText) + 1;
});

// Decrementa numero persone al click sul bottone '-'
decr_pers_bott.addEventListener('click', function() {
    if (Number(n_persone.innerText) > 1)
        n_persone.innerText = Number(n_persone.innerText) - 1;
});

// Crea ricetta al click sul bottone 'crea ricetta'
crea_bott.addEventListener('click', async function() {
    var formato = /^[A-Za-zàèéìòù]+(?:[ ,]+[A-Za-zàèéìòù]+)*$/;
    
    // Recupero informazioni
    const ingradienti = document.querySelector('#ingr').value.trim();
    if(ingradienti == '' || !formato.test(ingradienti)){
        console.log("Errore: Indicare gli ingradienti nel formato <ingradiente>, <ingradiente>, ... ");
        return;
    }
    const cucina = document.querySelector(".selezione-tipo-pulsante-input:checked").value;

    // Visualizza schermata di caricamento
    main.className = "caricamento";

    // Interazione con Gemini
    await chiama_gemini(ingradienti, cucina, n_persone.innerText);

    // Visualizza schede nella schermata dei risultati
    visualizza_schede();
    main.className = "risultati";
});

// Funzione per interagire con Gemini
async function chiama_gemini(ingradienti, tipo, persone) {
    const prompt = `
        Sto costruendo un'app che ha bisogno di JSON puro come output.
        Non aggiungere alcuna formattazione, markdown o codice. 
        Solo JSON puro nel formato seguente (nulla prima o dopo):
        [{"ricetta":"Pasta carbonara","info":[{"titolo":"Informazioni","testo":"Con questa ricetta otterrai la carbonara originale, cremosa e irresistibile"},{"titolo":"Procedimento","testo":"1) Cuocere la pasta al dente in abbondante acqua salata. 2) Rosolare il guanciale tagliato a cubetti in padella, senza aggiungere olio, fino a renderlo croccante e far fondere il suo grasso. 3) In una ciotola, mescolare i tuorli d’uovo, pecorino romano grattugiato e pepe nero macinato fresco. 4) Scolare la pasta e trasferirla nella padella con il guanciale, per farla insaporire nel grasso. 5) Aggiungere la crema di uova e formaggio, mescolando energicamente per ottenere una salsa cremosa. 6)  Servire con una spolverata di pecorino e pepe nero"}]}]
        Crea ricette per ${persone} persone ispirate alla cucina di tipo ${tipo} utilizzando ${ingradienti} come ingradienti.`;
    
    // Preparazione dati da inviare
    const configurazione = {
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY
        },
        method: 'POST',
        body: JSON.stringify({
            "contents": [{
                "parts": [{ 
                    "text": prompt
                }]
            }]
        })
    }

    // Invio richiesta e attesa risposta
    const risposta = (await fetch(API_ENDPOINT, configurazione));
    const rispostaJson = await risposta.json();

    schede_ricette = JSON.parse(rispostaJson.candidates[0].content.parts[0].text);
}

// Funzione per visualizzare le schede nella schermata dei risultati
function visualizza_schede() {
    schede_ricette.forEach( function(ric) {

        const template_scheda = `
            <div class="scheda">
                <h3 class="scheda-titolo scheda-titolo-risultati">${ric.ricetta}</h3>
                    <div class="ricetta">
                        <h4>Informazioni</h4>
                        <p>${ric.info[0].testo}</p>
                    </div>
                <div class="ricetta">
                    <h4>Preparazione</h4>
                    <p>${ric.info[1].testo}</p>
                </div>
            </div>
            `;

        // Mostra il risultato a schermo
        contieni_ris.innerHTML += template_scheda;
    });    
}

// Crea nuova ricetta al click sul bottone 'crea nuova ricetta' nella pagina dei risultati
crea_nuovo_bott.addEventListener('click', function() {
    location.reload();
});