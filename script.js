const data = fetch("https://restcountries.com/v3.1/all");
let countries = data
  .then((response) => {
    return response.json();
  })
  .then((r) => {
    findRegions(r);

    return r;
  });
console.log("countries=", countries);
const container = document.createElement("div");
container.className = "container";
const row = document.createElement("div");
row.className = "row";
let d = document.createElement("div");
document.body.append(d);
d.innerHTML = `<div class="modal fade"
id="weather"
tabindex="-1"
aria-labelledby="exampleModalLabel"
aria-hidden="true">
<div class="modal-dialog modal-dialog-centered modal-lg">
<div class="modal-content">
  <div class="modal-header">
    <h2 class="modal-title text-center" id="weatherTitle">Weather</h2>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  </div>
  <div class="modal-body" >
  <canvas id="Chart"></canvas>
   
  </div>

</div>
</div>
</div>`;

const regions = document.getElementById("regions");
regions.addEventListener("change", (event) => {
  countries.then((r) => createCards(event, r)).catch((e) => console.log(e));
});

function findRegions(data) {
  let regionSet = new Set(data.map((country) => country.region));
  // console.log(regionSet);
  let options = `<option>--Select a region --</option>`;
  regionSet.forEach(
    (region) => (options += `<option  value='${region}'>${region}</option>`)
  );
  regions.innerHTML = options;
}

function closeDialog() {
  d.close();
}
function populateDialog(data, city) {
  console.log("modal");
  document.getElementById(
    "weatherTitle"
  ).innerText = `WEATHER at ${city}  ( ${data.latitude} ,${data.longitude} )`;
  const ctx = document.getElementById("Chart").getContext("2d");
  let labels = Object.values(data.hourly.time).map((d) => d.slice(11));
  let dataObj = {
    type: "line",
    data: { labels: [], datasets: [{}] },
  };
  dataObj.data.labels = labels;
  let obj = {};
  obj.label = "Celsius";
  obj.data = Object.values(data.hourly.temperature_2m);
  obj.background = "rgba(204, 221, 213,0.2);";
  dataObj.data.datasets = [obj];
  let myChart = new Chart(ctx, dataObj);
}
function showDialog(e, lat, lon, city) {
  console.log(lat, lon);
  let url =
    "https://api.open-meteo.com/v1/forecast?latitude=" +
    lat +
    "&longitude=" +
    lon +
    "&hourly=temperature_2m&forecast_days=1";
  console.log(url);
  fetch(url)
    .then((res) => res.json())
    .then((r) => {
      populateDialog(r, city);
    })
    .catch((e) => console.log(e));
}

function createCards(event, countries) {
  console.log(countries[0]);
  let regionCountries = countries.filter(
    (country) => country.region == regions.value
  );
  row.innerHTML = "";
  for (let c of regionCountries) {
    const col = document.createElement("div");

    col.className = "col-md-4 my-3 text-center";
    col.innerHTML = `<div class="card" >
 
    <div class="card-body">
      <h5 class="card-title" >${c.name.common}</h5>
      <img src=${c.flags.png} class="card-img-top my-2" alt="${c.flags.alt}">
      <p class="card-text text-center">Capital: ${c.capital?.join()}<br>Region: ${
      c.region
    }<br>Country Code: ${c.altSpellings[0]}</p>
      <button onclick="showDialog(event,'${c.latlng ? c.latlng[0] : null}','${
      c.latlng ? c.latlng[1] : null
    }','${c.capital[0]}, ${
      c.name.common
    }')" class="btn btn-success"  data-bs-toggle="modal" data-bs-target="#weather">Get Weather
           
      </button>
    </div>
  </div>`;

    row.append(col);
  }
  container.append(row);
  document.body.append(container);
}
