/* ============================================================
   TRAVEL DASHBOARD — main.js
   APIs: Open-Meteo (clima) · Frankfurter (moneda)
   Tècniques: fetch, async/await, querySelector, addEventListener,
              manipulació DOM, funcions, control d'errors
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────
   1. ESTRUCTURA DE DADES — CIUTATS
   ────────────────────────────────────────────── */
const CITY_IMAGES = {
  barcelona: 'assets/images/barcelona.jpg',
  london: "assets/images/london.jpg",
  paris: 'assets/images/paris.jpg',
  newyork: 'assets/images/NY.jpg',
  tokyo: 'assets/images/tokyo.jpg'
};

const CITIES = {
  barcelona: {
    name:        'Barcelona',
    country:     'Espanya',
    flag:        '🇪🇸',
    lat:         41.3851,
    lon:         2.1734,
    currency:    'EUR',
    currencySymbol: '€',
    description: 'Barcelona, capital de Catalunya, és una de les ciutats més vibrants d\'Europa. ' +
                 'Fundada pels romans com a "Barcino" fa més de 2.000 anys, avui combina ' +
                 'arquitectura modernista única —la Sagrada Família, el Park Güell o la Casa Batlló ' +
                 'de Gaudí— amb unes platges mediterrànies i una gastronomia de primer nivell. ' +
                 'El barri Gòtic, les Rambles i el mercat de la Boqueria són visites imprescindibles.'
  },
  london: {
    name:        'London',
    country:     'Regne Unit',
    flag:        '🇬🇧',
    lat:         51.5074,
    lon:        -0.1278,
    currency:    'GBP',
    currencySymbol: '£',
    description: 'Londres és la capital del Regne Unit i una de les ciutats globals per excel·lència. ' +
                 'Amb una història de quasi 2.000 anys —fundada pels romans com a "Londinium"— ' +
                 'alberga icones com el Big Ben, el Tower Bridge, el Buckingham Palace i el British Museum. ' +
                 'Els seus parcs reials, la zona de Shoreditch i el mercat de Borough Market la fan ' +
                 'inoblidable. El temps és fresc i, sí, plou sovint!'
  },
  paris: {
    name:        'Paris',
    country:     'França',
    flag:        '🇫🇷',
    lat:         48.8566,
    lon:         2.3522,
    currency:    'EUR',
    currencySymbol: '€',
    description: 'París, la "Ville Lumière", és la capital de França i una de les destinacions ' +
                 'turístiques més visitades del món. La Torre Eiffel, el Museu del Louvre —on hi ' +
                 'resideix la Mona Lisa—, Notre-Dame i els Camps Elisis defineixen el seu skyline i ' +
                 'el seu encant. La gastronomia parisenca, els cafès de barri i la moda la converteixen ' +
                 'en un referent cultural global ineguipassat.'
  },
  newyork: {
    name:        'New York',
    country:     'Estats Units',
    flag:        '🇺🇸',
    lat:         40.7128,
    lon:        -74.0060,
    currency:    'USD',
    currencySymbol: '$',
    description: 'Nova York, la "Big Apple", és la ciutat més poblada dels EUA i un centre neuràlgic ' +
                 'de finances, cultura i art. Manhattan, amb el seu skyline d\'escatcels inconfusible, ' +
                 'acull el Central Park, el Times Square, l\'Empire State Building i la Statue of Liberty. ' +
                 'Brooklyn, Queens i el Bronx ofereixen una diversitat cultural única. ' +
                 'La seva escena gastronòmica, musical i artística és inesgotable.'
  },
  tokyo: {
    name:        'Tokyo',
    country:     'Japó',
    flag:        '🇯🇵',
    lat:         35.6762,
    lon:        139.6503,
    currency:    'JPY',
    currencySymbol: '¥',
    description: 'Tòquio, la capital del Japó, és la metròpoli més gran del món. ' +
                 'Combina amb harmonia la tradició més profunda —temples xintoistes, jardins zen, ' +
                 'el barri de Asakusa— amb la tecnologia i la modernitat futurista de Shibuya, Akihabara ' +
                 'i Shinjuku. La seva gastronomia, que inclou el sushi, el ramen i l\'okonomiyaki, ' +
                 'és reconeguda internacionalment. Els jardins imperials i el mont Fuji proporcionen ' +
                 'un contrapunt natural imprescindible.'
  }
};

/* ──────────────────────────────────────────────
   2. SELECTORS DOM
   ────────────────────────────────────────────── */
const citySelect    = document.getElementById('citySelect');
const dashboard     = document.getElementById('dashboard');
const loadingState  = document.getElementById('loadingState');
const errorState    = document.getElementById('errorState');
const errorMessage  = document.getElementById('errorMessage');
const amountInput   = document.getElementById('amountInput');

// Card Resum
const cityName      = document.getElementById('cityName');
const cityCoords    = document.getElementById('cityCoords');
const cityFlag      = document.getElementById('cityFlag');
const cityCountry   = document.getElementById('cityCountry');
const cityCurrency  = document.getElementById('cityCurrency');
const heroTemp      = document.getElementById('heroTemp');
const cityDescription = document.getElementById('cityDescription');

// Widget Meteorologia
const weatherIcon   = document.getElementById('weatherIcon');
const weatherTemp   = document.getElementById('weatherTemp');
const rainProb      = document.getElementById('rainProb');
const feelsLike     = document.getElementById('feelsLike');
const windSpeed     = document.getElementById('windSpeed');
const rainLabel     = document.getElementById('rainLabel');
const rainBarFill   = document.getElementById('rainBarFill');

// Widget Moneda
const exchangeRate  = document.getElementById('exchangeRate');
const resultFrom    = document.getElementById('resultFrom');
const resultTo      = document.getElementById('resultTo');
const resultAmount  = document.getElementById('resultAmount');
const currencyNote  = document.getElementById('currencyNote');

// Tip
const tipIcon       = document.getElementById('tipIcon');
const tipText       = document.getElementById('tipText');

/* ──────────────────────────────────────────────
   3. ESTAT GLOBAL
   ────────────────────────────────────────────── */
let currentCity     = null;   // objecte de la ciutat activa
let currentRate     = null;   // taxa EUR → moneda local
let currentTempVal  = null;   // temperatura en enters

/* ──────────────────────────────────────────────
   4. FUNCIONS D'UTILITAT
   ────────────────────────────────────────────── */

/**
 * Mostra/amaga seccions de la UI
 */
function showLoading() {
  loadingState.classList.remove('hidden');
  dashboard.classList.add('hidden');
  errorState.classList.add('hidden');
}

function showDashboard() {
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  dashboard.classList.remove('hidden');
}

function showError(msg) {
  loadingState.classList.add('hidden');
  dashboard.classList.add('hidden');
  errorState.classList.remove('hidden');
  errorMessage.textContent = msg;
}

/**
 * Interpreta el codi WMO del temps i retorna emoji + text
 */
function interpretWeatherCode(code) {
  if (code === 0)               return { icon: '☀️',  text: 'Cel clar' };
  if (code <= 2)                return { icon: '🌤️', text: 'Parcialment ennuvolat' };
  if (code === 3)               return { icon: '☁️',  text: 'Cobert' };
  if (code <= 48)               return { icon: '🌫️', text: 'Boira' };
  if (code <= 57)               return { icon: '🌦️', text: 'Pluja feble' };
  if (code <= 67)               return { icon: '🌧️', text: 'Pluja' };
  if (code <= 77)               return { icon: '❄️',  text: 'Neu' };
  if (code <= 82)               return { icon: '🌦️', text: 'Xàfecs' };
  if (code <= 99)               return { icon: '⛈️',  text: 'Tempesta' };
  return { icon: '🌡️', text: 'Desconegut' };
}

/**
 * Interpreta la probabilitat de pluja (0–100)
 * i retorna emoji + text + color per a la barra
 */
function interpretRain(prob) {
  if (prob < 20)  return { label: '☀️ Sense pluja',               color: '#22c55e' };
  if (prob < 50)  return { label: '🌦️ Possibles precipitacions',  color: '#f5c842' };
  return             { label: '🌧️ Probable pluja',                color: '#4f8ef7' };
}

/**
 * Genera el missatge de consell de viatge
 */
function generateTip(city, temp, prob, rate) {
  if (temp <= 5)  return { icon: '🧥', text: `Recorda portar abric: la temperatura a ${city.name} és molt baixa, ${temp}°C.` };
  if (temp <= 15) return { icon: '🧣', text: `Porta una jaqueta! A ${city.name} fa ${temp}°C i pot fer fresqueta.` };
  if (temp >= 30) return { icon: '🌞', text: `Avui fa molta calor a ${city.name} (${temp}°C). Hidrata't i usa protecció solar!` };
  if (prob >= 50) return { icon: '☂️', text: `Alta probabilitat de pluja a ${city.name}. Millor porta un paraigua!` };
  if (city.currency !== 'EUR') {
    const ex = rate ? `100 EUR equivalen a ${Math.round(rate * 100)} ${city.currency}` : '';
    return { icon: '💱', text: `${city.name} utilitza ${city.currency}. ${ex}. Recorda canviar moneda!` };
  }
  return { icon: '✈️', text: `Avui fa bon temps per passejar per ${city.name}. Gaudeix del viatge!` };
}

/* ──────────────────────────────────────────────
   5. FETCH CLIMA — Open-Meteo (sense API key)
   ────────────────────────────────────────────── */
async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,precipitation_probability,windspeed_10m,weathercode` +
    `&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error clima: ${res.status}`);
  const data = await res.json();
  return data.current;
}

/* ──────────────────────────────────────────────
   6. FETCH MONEDA — Frankfurter (sense API key)
   Base EUR → moneda destí
   ────────────────────────────────────────────── */
async function fetchExchangeRate(targetCurrency) {
  // Si la moneda destí és EUR, la taxa és 1 (no cal cridar l'API)
  if (targetCurrency === 'EUR') return 1;

  const url = `https://api.frankfurter.app/latest?from=EUR&to=${targetCurrency}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Error moneda: ${res.status}`);
  const data = await res.json();

  // data.rates és { "GBP": 0.853 } per exemple
  const rate = data.rates[targetCurrency];
  if (!rate) throw new Error(`No s'ha trobat la taxa per a ${targetCurrency}`);
  return rate;
}

/* ──────────────────────────────────────────────
   7. RENDERITZAT DEL DASHBOARD
   ────────────────────────────────────────────── */
function renderSummaryCard(city, temp) {
  // Nom i coordenades
  cityName.textContent    = city.name;
  cityCoords.textContent  = `📍 Lat: ${city.lat}° · Lon: ${city.lon}°`;
  cityFlag.textContent    = city.flag;
  cityCountry.textContent = `🌍 ${city.country}`;
  cityCurrency.textContent= `💰 ${city.currency}`;

  // Temperatura sencer (sense decimals)
  heroTemp.textContent = `${Math.round(temp)}°C`;

  // Descripció
  cityDescription.textContent = city.description;
}

function renderWeather(weather) {
  const temp    = Math.round(weather.temperature_2m);          // enter
  const feels   = Math.round(weather.apparent_temperature);    // enter
  const prob    = weather.precipitation_probability ?? 0;
  const wind    = Math.round(weather.windspeed_10m);
  const code    = weather.weathercode;

  const wInfo   = interpretWeatherCode(code);
  const rInfo   = interpretRain(prob);

  // Icona i temperatura
  weatherIcon.textContent   = wInfo.icon;
  //  color de fons dinàmic segons condició meteorològica
const weatherColors = {
  sun:    { bg: 'rgba(245,200,66,0.15)',  shadow: 'rgba(245,200,66,0.3)'  },
  cloud:  { bg: 'rgba(148,163,184,0.15)', shadow: 'rgba(148,163,184,0.2)' },
  fog:    { bg: 'rgba(100,116,139,0.15)', shadow: 'rgba(100,116,139,0.2)' },
  rain:   { bg: 'rgba(79,142,247,0.15)',  shadow: 'rgba(79,142,247,0.3)'  },
  snow:   { bg: 'rgba(186,230,253,0.15)', shadow: 'rgba(186,230,253,0.3)' },
  storm:  { bg: 'rgba(124,58,237,0.15)',  shadow: 'rgba(124,58,237,0.3)'  },
};

let wColorKey = 'sun';
if (code === 3)        wColorKey = 'cloud';
else if (code <= 2)    wColorKey = 'sun';
else if (code <= 48)   wColorKey = 'fog';
else if (code <= 67)   wColorKey = 'rain';
else if (code <= 77)   wColorKey = 'snow';
else if (code <= 82)   wColorKey = 'rain';
else if (code <= 99)   wColorKey = 'storm';

const wc = weatherColors[wColorKey];
weatherIcon.style.background = wc.bg;
weatherIcon.style.boxShadow  = `0 0 20px ${wc.shadow}`;

  weatherTemp.textContent   = temp;

  // Detalls
  rainProb.textContent      = `${prob}%`;
  feelsLike.textContent     = `${feels}°C`;
  windSpeed.textContent     = `${wind} km/h`;

  // Barra de pluja
  rainLabel.textContent     = rInfo.label;
  rainBarFill.style.width   = `${prob}%`;
  rainBarFill.style.background = `linear-gradient(90deg, ${rInfo.color}, ${rInfo.color}99)`;

  // Guardem valors globals
  currentTempVal = temp;

  return { temp, prob };
}

function renderCurrency(rate, city) {
  currentRate = rate;

  const roundedRate = parseFloat(rate.toFixed(2));
  currentRate = roundedRate;
  
  // Formatem la taxa
  const rateDisplay = city.currency === 'EUR'
    ? '1 EUR = 1 EUR (mateixa moneda)'
    : `1 EUR = ${roundedRate.toFixed(2)} ${city.currency}`;

  exchangeRate.textContent = rateDisplay;

  // Nota si mateixa moneda
  if (city.currency === 'EUR') {
    currencyNote.textContent = 'La destinació utilitza l\'Euro. No cal conversió.';
  } else {
    currencyNote.textContent = `Taxa obtinguda en temps real via Frankfurter API`;
  }

  // Calcular i mostrar conversió inicial
  calculateConversion(city);
}

function calculateConversion(city) {
  const city_ = city || currentCity;
  if (!city_ || currentRate === null) return;

  const amount = parseFloat(amountInput.value) || 0;
  const result = amount * currentRate;

  resultFrom.textContent  = `${amount.toFixed(2)} EUR`;
  resultTo.textContent    = city_.currency;

  // Format amb 2 decimals per EUR/GBP/USD, 0 per JPY (no té decimals)
  if (city_.currency === 'JPY') {
    resultAmount.textContent = `${city_.currencySymbol} ${Math.round(result).toLocaleString('ca-ES')}`;
  } else {
    resultAmount.textContent = `${city_.currencySymbol} ${result.toFixed(2)}`;
  }
}

function renderTip(city, temp, prob, rate) {
  const tip = generateTip(city, temp, prob, rate);
  tipIcon.textContent = tip.icon;
  tipText.textContent = tip.text;
}

/* ──────────────────────────────────────────────
   8. FUNCIÓ PRINCIPAL — carrega totes les dades
   ────────────────────────────────────────────── */
async function loadCityData(cityKey) {
  const city = CITIES[cityKey];
  if (!city) return;

  currentCity = city;
  currentRate = null;

  showLoading();

  try {
    // Cridem les dues APIs en paral·lel per eficiència
    const [weatherData, rate] = await Promise.all([
      fetchWeather(city.lat, city.lon),
      fetchExchangeRate(city.currency)
    ]);

    const bg = document.getElementById('cardBg');

    bg.style.backgroundImage = `url(${CITY_IMAGES[cityKey]})`;
    bg.style.backgroundPosition = "center";
    bg.style.backgroundSize = "cover";

    // Renderitzem tots els components
    const { temp, prob } = renderWeather(weatherData);
    renderSummaryCard(city, temp);
    renderCurrency(rate, city);
    renderTip(city, temp, prob, rate);

    showDashboard();

  } catch (err) {
    console.error('Error carregant dades:', err);
    showError(`No s'han pogut carregar les dades: ${err.message}. Comprova la connexió i torna-ho a intentar.`);
  }
}

/* ──────────────────────────────────────────────
   9. EVENT LISTENERS
   ────────────────────────────────────────────── */

// Canvi de ciutat
citySelect.addEventListener('change', function () {
  const selected = this.value;
  if (!selected) {
    dashboard.classList.add('hidden');
    errorState.classList.add('hidden');
    loadingState.classList.add('hidden');
    return;
  }
  loadCityData(selected);
});

// Conversió en temps real quan l'usuari escriu
amountInput.addEventListener('input', function () {
  calculateConversion(currentCity);
});

// Evitar valors negatius
amountInput.addEventListener('change', function () {
  if (parseFloat(this.value) < 0) this.value = 0;
  calculateConversion(currentCity);
});

// Commit 4 — Lògica de la pantalla de benvinguda
const welcomeScreen = document.getElementById('welcomeScreen');

function showWelcome() {
  welcomeScreen.classList.remove('hidden');
}

function hideWelcome() {
  welcomeScreen.classList.add('hidden');
}

// Clic en les targetes de ciutat de la pantalla de benvinguda
document.querySelectorAll('.city-card').forEach(btn => {
  btn.addEventListener('click', function () {
    const cityKey = this.dataset.city;
    // Sincronitzem el select
    citySelect.value = cityKey;
    hideWelcome();
    loadCityData(cityKey);
  });
});

// Quan l'usuari tria al select, també amaguem la benvinguda
citySelect.addEventListener('change', function () {
  if (this.value) hideWelcome();
  else showWelcome();
});

// Mostrem la pantalla de benvinguda a l'inici
showWelcome();