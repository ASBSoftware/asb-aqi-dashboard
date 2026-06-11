let allSensors = [];

const API_BASE =
    "https://asb-aqi-api.onrender.com";

let iaqChart;
let tempChart;
let humidityChart;
let noiseChart;
let historyChart;

/* ===========================
   CLOCK
=========================== */

function startClock() {

    function updateClock() {

        const now = new Date();

        document.getElementById(
            "liveClock"
        ).innerText =
            now.toLocaleTimeString();

    }

    updateClock();

    setInterval(
        updateClock,
        1000
    );
}

/* ===========================
   LOAD DATA
=========================== */

async function loadDashboard() {

    try {

        const response =
            await fetch(
    `${API_BASE}/api/sensors`
);

        allSensors =
            await response.json();

        filterAndRender();

        document.getElementById(
            "lastUpdated"
        ).innerText =
            new Date().toLocaleString();

    }
    catch(err){

        console.error(err);

        document.getElementById(
            "alertContainer"
        ).innerHTML =
        `
        <div class="alert">
            Unable to connect to API
        </div>
        `;
    }
}

async function loadHistory(){

    try{

        const days =
            document.getElementById(
                "historyDays"
            ).value;

        const response =
            await fetch(
    `${API_BASE}/api/history?days=${days}`
);

        const history =
            await response.json();

            history.sort(
    (a,b)=>
    new Date(a.timestamp) -
    new Date(b.timestamp)
);

        console.log("History:", history);

        const iaqHistory =
            history.filter(
                h =>
                h.metric ===
                "indoorAirQuality"
            );

        console.log(
            "IAQ History:",
            iaqHistory
        );

       const sampled =
    history.filter(
        (_, index) =>
        index % 100 === 0
    );

const labels =
    sampled.map(
        h =>
        new Date(
            h.timestamp
        ).toLocaleTimeString()
    );

const iaqData =
    sampled.map(
        h => h.iaq
    );

        if(historyChart)
            historyChart.destroy();

        historyChart =
            new Chart(
                document.getElementById(
                    "historyChart"
                ),
                {
                    type:"line",

                    data:{

                        labels,

                        datasets:[{

                            label:
                                "IAQ Trend",

                            data:
                                iaqData,

                            borderWidth:3,

                            tension:.3,

                            fill:false

                        }]
                    },

                    options:{

                        responsive:true,

                        maintainAspectRatio:false,

                        scales:{
                            y:{
                                beginAtZero:false,
                                min:50,
                                max:100
                            }
                        }

                    }

                }
            );

    }
    catch(err){

        console.error(
            "History Error:",
            err
        );

    }

}

/* ===========================
   FILTERING
=========================== */

function filterAndRender() {

    const campus =
        document.getElementById(
            "campusSelect"
        ).value;

    const search =
        document.getElementById(
            "searchBox"
        ).value
        .toLowerCase();

    let sensors =
        [...allSensors];

    if(campus !== "all"){

        sensors =
            sensors.filter(
                s =>
                s.network === campus
            );
    }

    if(search){

        sensors =
            sensors.filter(
                s =>
                s.name
                .toLowerCase()
                .includes(search)
            );
    }

    buildDashboard(
        sensors
    );
}
const LIMITS = {

    temperature: 27,
    humidity: 80,
    tvoc: 3000,
    pm25: 53,
    co2: 1500,
    noise: 80

};

function getAlertLevel(value, limit){

    if(value >= limit * 1.20)
        return "critical";

    if(value >= limit)
        return "danger";

    if(value >= limit * 0.90)
        return "warning";

    return null;
}
/* ===========================
   DASHBOARD
=========================== */

function buildDashboard(
    sensors
){

    if(!sensors.length)
        return;

    let totalIAQ = 0;
    let totalTemp = 0;
    let totalHumidity = 0;
    let totalTVOC = 0;
    let totalPM25 = 0;
    let totalNoise = 0;
    let totalCO2 = 0;

   let poorAirAlerts = [];
   let tempAlerts = [];
   let humidityAlerts = [];
let tvocAlerts = [];
let pm25Alerts = [];
let noiseAlerts = [];
let co2Alerts = [];
   let cards = "";

    let labels = [];
    let iaqData = [];
    let tempData = [];
    let humidityData = [];
    let noiseData = [];

    const floorMap = {};

    sensors.forEach(sensor => {

        const iaq =
            sensor.iaq || 0;

        const temp =
            sensor.temperature || 0;

        const humidity =
            sensor.humidity || 0;

        const noise =
            sensor.noise || 0;

        const tvoc =
            sensor.tvoc || 0;

        const pm25 =
            sensor.pm25 || 0;

        const co2 =
            sensor.co2 || 0;

        const battery =
            sensor.battery || 0;

        totalIAQ += iaq;
        totalTemp += temp;
        totalHumidity += humidity;
        totalTVOC += tvoc;
        totalPM25 += pm25;
        totalNoise += noise;
        totalCO2 += co2;

        labels.push(
            sensor.name
        );

        iaqData.push(
            iaq
        );

        tempData.push(
            temp
        );

        humidityData.push(
            humidity
        );

        noiseData.push(
            noise
        );

        let badgeClass =
            "good";

        let status =
            "Excellent";

        if(iaq < 75){

            badgeClass =
                "bad";

            status =
                "Poor";
        }
        else if(iaq < 90){

            badgeClass =
                "medium";

            status =
                "Fair";
        }

    if(iaq < 75){

   poorAirAlerts.push({
    room: sensor.name,
    value: iaq,
    battery: sensor.battery,
    floor: sensor.floor
});

}

if(temp > 28){

   tempAlerts.push({
    room: sensor.name,
    value: temp.toFixed(1),
    humidity: sensor.humidity,
    floor: sensor.floor
});

}
const humidityLevel =
    getAlertLevel(
        humidity,
        LIMITS.humidity
    );

if(humidityLevel){

    humidityAlerts.push({

        room: sensor.name,
        value: humidity,
        floor: sensor.floor,
        level: humidityLevel

    });

}

const tvocLevel =
    getAlertLevel(
        tvoc,
        LIMITS.tvoc
    );

if(tvocLevel){

    tvocAlerts.push({

        room: sensor.name,
        value: tvoc,
        floor: sensor.floor,
        level: tvocLevel

    });

}

const pm25Level =
    getAlertLevel(
        pm25,
        LIMITS.pm25
    );

if(pm25Level){

    pm25Alerts.push({

        room: sensor.name,
        value: pm25,
        floor: sensor.floor,
        level: pm25Level

    });

}
const noiseLevel =
    getAlertLevel(
        noise,
        LIMITS.noise
    );

if(noiseLevel){

    noiseAlerts.push({

        room: sensor.name,
        value: noise,
        floor: sensor.floor,
        level: noiseLevel

    });

}

const co2Level =
    getAlertLevel(
        co2,
        LIMITS.co2
    );

if(co2Level){

    co2Alerts.push({

        room: sensor.name,
        value: co2,
        floor: sensor.floor,
        level: co2Level

    });

}

        const floor =
            sensor.floor ||
            "Other";

        if(!floorMap[floor]){

            floorMap[floor] = {

                total:0,
                count:0
            };
        }

        floorMap[floor].total += iaq;
        floorMap[floor].count++;

        cards +=
        `
        <div class="sensor-card">

            <div class="sensor-header">

                <div>

                    <div class="sensor-name">
                        ${sensor.name}
                    </div>

                    <div class="sensor-campus">
                        ${sensor.network}
                    </div>

                </div>

                <div class="badge ${badgeClass}">
                    ${status}
                </div>

            </div>

            <div class="sensor-score ${badgeClass}">
                ${iaq}
            </div>

            <div class="sensor-metrics">

                <div class="sensor-metric">
                    <span>Temp</span>
                    <strong>${temp.toFixed(1)}°C</strong>
                </div>

                <div class="sensor-metric">
                    <span>Humidity</span>
                    <strong>${humidity}%</strong>
                </div>

                <div class="sensor-metric">
                    <span>CO₂</span>
                    <strong>${co2}</strong>
                </div>

                <div class="sensor-metric">
                    <span>TVOC</span>
                    <strong>${tvoc}</strong>
                </div>

                <div class="sensor-metric">
                    <span>PM2.5</span>
                    <strong>${pm25}</strong>
                </div>

                <div class="sensor-metric">
                    <span>Battery</span>
                    <strong>${battery}%</strong>
                </div>

            </div>

        </div>
        `;
    });

    const count =
        sensors.length;

    const avgIAQ =
        Math.round(
            totalIAQ / count
        );

    document.getElementById(
        "overallIAQ"
    ).innerText =
        avgIAQ;

    document.getElementById(
        "sensorCount"
    ).innerText =
        count;

    document.getElementById(
        "avgTemp"
    ).innerText =
        (
            totalTemp / count
        ).toFixed(1)
        + "°C";

    document.getElementById(
        "avgHumidity"
    ).innerText =
        (
            totalHumidity / count
        ).toFixed(0)
        + "%";

    document.getElementById(
        "avgTVOC"
    ).innerText =
        (
            totalTVOC / count
        ).toFixed(0);

    document.getElementById(
        "avgPM25"
    ).innerText =
        (
            totalPM25 / count
        ).toFixed(0);

    document.getElementById(
        "avgNoise"
    ).innerText =
        (
            totalNoise / count
        ).toFixed(0);

    document.getElementById(
        "avgCO2"
    ).innerText =
        (
            totalCO2 / count
        ).toFixed(0);

    document.getElementById(
        "overallStatus"
    ).innerText =
        avgIAQ >= 90
        ? "Excellent"
        : avgIAQ >= 75
        ? "Good"
        : "Needs Attention";


        poorAirAlerts.sort(
    (a,b) => b.value - a.value
);

tempAlerts.sort(
    (a,b) => b.value - a.value
);

humidityAlerts.sort(
    (a,b) => b.value - a.value
);

tvocAlerts.sort(
    (a,b) => b.value - a.value
);

pm25Alerts.sort(
    (a,b) => b.value - a.value
);

noiseAlerts.sort(
    (a,b) => b.value - a.value
);

co2Alerts.sort(
    (a,b) => b.value - a.value
);
poorAirAlerts.sort(
    (a,b) => a.value - b.value
);
    let alertHTML = `<div class="alert-grid">`;

if(poorAirAlerts.length){

    alertHTML += `
    <div class="alert-group danger">

        <h3>
            🔴 Poor Air Quality
            <span class="alert-count">
                ${poorAirAlerts.length}
            </span>
        </h3>

        ${poorAirAlerts.map(a => `
           <div class="alert-row">

    <div>

        <div class="alert-room">
            ${a.room}
        </div>

        <div class="alert-meta">
            ${a.floor}
        </div>

    </div>

    <strong>
        ${a.value}
    </strong>

</div>
        `).join("")}

    </div>
    `;
}

if(tempAlerts.length){

    alertHTML += `
    <div class="alert-group warning">

        <h3>
            🟠 High Temperature
            <span class="alert-count">
                ${tempAlerts.length}
            </span>
        </h3>

        ${tempAlerts.map(a => `
            <div class="alert-row">
                <span>${a.room}</span>
                <strong>${a.value}°C</strong>
            </div>
        `).join("")}

    </div>
    `;
}

if(humidityAlerts.length){

alertHTML += `
<div class="alert-group warning">

<h3>
💧 High Humidity
<span class="alert-count">
${humidityAlerts.length}
</span>
</h3>

${humidityAlerts.map(a => `
<div class="alert-row">
<span>${a.room}</span>
<strong>
${a.value}%
${a.level === "critical" ? "🚨" :
  a.level === "danger" ? "🔴" :
  "🟡"}
</strong>
</div>
`).join("")}

</div>
`;

}

if(tvocAlerts.length){

alertHTML += `
<div class="alert-group warning">

<h3>
🧪 High TVOC
<span class="alert-count">
${tvocAlerts.length}
</span>
</h3>

${tvocAlerts.map(a => `
<div class="alert-row">
<span>${a.room}</span>
<strong>${a.value}</strong>
</div>
`).join("")}

</div>
`;

}
if(pm25Alerts.length){

alertHTML += `
<div class="alert-group danger">

<h3>
🌫 PM2.5 Alert
<span class="alert-count">
${pm25Alerts.length}
</span>
</h3>

${pm25Alerts.map(a => `
<div class="alert-row">
<span>${a.room}</span>
<strong>${a.value}</strong>
</div>
`).join("")}

</div>
`;

}
if(noiseAlerts.length){

alertHTML += `
<div class="alert-group warning">

<h3>
🔊 High Noise
<span class="alert-count">
${noiseAlerts.length}
</span>
</h3>

${noiseAlerts.map(a => `
<div class="alert-row">
<span>${a.room}</span>
<strong>${a.value} dBA</strong>
</div>
`).join("")}

</div>
`;

}
if(co2Alerts.length){

alertHTML += `
<div class="alert-group danger">

<h3>
🫁 High CO₂
<span class="alert-count">
${co2Alerts.length}
</span>
</h3>

${co2Alerts.map(a => `
<div class="alert-row">
<span>${a.room}</span>
<strong>${a.value} ppm</strong>
</div>
`).join("")}

</div>
`;

}
if(
    !poorAirAlerts.length &&
    !tempAlerts.length &&
    !humidityAlerts.length &&
    !tvocAlerts.length &&
    !pm25Alerts.length &&
    !noiseAlerts.length &&
    !co2Alerts.length
){

    alertHTML += `
    <div class="alert-empty">
        ✅ No Active Alerts
    </div>
    `;
}

alertHTML += `</div>`;

document.getElementById(
    "alertContainer"
).innerHTML = alertHTML;

    document.getElementById(
        "sensorCards"
    ).innerHTML =
        cards;

    buildTopRooms(
        sensors
    );

    buildWorstRooms(
        sensors
    );

    buildFloorHeatmap(
        floorMap
    );

    renderCharts(
        labels,
        iaqData,
        tempData,
        humidityData,
        noiseData
    );
}

/* ===========================
   TOP ROOMS
=========================== */

function buildTopRooms(
    sensors
){

    const top =
        [...sensors]
        .sort(
            (a,b)=>
            b.iaq-a.iaq
        )
        .slice(0,5);

    document.getElementById(
        "topRooms"
    ).innerHTML =
        top.map(
            r =>
            `
            <div class="room-item">
                <span>${r.name}</span>
                <strong>${r.iaq}</strong>
            </div>
            `
        ).join("");
}

function buildWorstRooms(
    sensors
){

    const worst =
        [...sensors]
        .sort(
            (a,b)=>
            a.iaq-b.iaq
        )
        .slice(0,5);

    document.getElementById(
        "worstRooms"
    ).innerHTML =
        worst.map(
            r =>
            `
            <div class="room-item">
                <span>${r.name}</span>
                <strong>${r.iaq}</strong>
            </div>
            `
        ).join("");
}

/* ===========================
   FLOOR HEATMAP
=========================== */

function buildFloorHeatmap(
    floorMap
){

    let html = "";

    Object.keys(
        floorMap
    ).forEach(floor => {

        const avg =
            Math.round(
                floorMap[floor].total /
                floorMap[floor].count
            );

        html +=
        `
        <div class="floor-card">

            <h3>${floor}</h3>

            <div class="score">
                ${avg}
            </div>

            <p>
                Average IAQ
            </p>

        </div>
        `;
    });

    document.getElementById(
        "floorContainer"
    ).innerHTML =
        html;
}



/* ===========================
   CHARTS
=========================== */

function renderCharts(
    labels,
    iaqData,
    tempData,
    humidityData,
    noiseData
){

    if(iaqChart) iaqChart.destroy();
    if(tempChart) tempChart.destroy();
    if(humidityChart) humidityChart.destroy();
    if(noiseChart) noiseChart.destroy();

    iaqChart =
        new Chart(
            document.getElementById(
                "iaqChart"
            ),
            {
                type:"bar",
                data:{
                    labels,
                    datasets:[{
                        label:"IAQ",
                        data:iaqData
                    }]
                }
            }
        );

    tempChart =
        new Chart(
            document.getElementById(
                "tempChart"
            ),
            {
                type:"line",
                data:{
                    labels,
                    datasets:[{
                        label:"Temperature",
                        data:tempData
                    }]
                }
            }
        );

    humidityChart =
        new Chart(
            document.getElementById(
                "humidityChart"
            ),
            {
                type:"bar",
                data:{
                    labels,
                    datasets:[{
                        label:"Humidity",
                        data:humidityData
                    }]
                }
            }
        );

    noiseChart =
        new Chart(
            document.getElementById(
                "noiseChart"
            ),
            {
                type:"line",
                data:{
                    labels,
                    datasets:[{
                        label:"Noise",
                        data:noiseData
                    }]
                }
            }
        );
}

/* ===========================
   EVENTS
=========================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        startClock();

        document
            .getElementById(
                "searchBox"
            )
            .addEventListener(
                "input",
                filterAndRender
            );

        document
            .getElementById(
                "campusSelect"
            )
            .addEventListener(
                "change",
                filterAndRender
            );

        document
            .getElementById(
                "loadHistoryBtn"
            )
            ?.addEventListener(
                "click",
                loadHistory
            );

        setInterval(
            loadDashboard,
            30000
        );

        const allowedUsers = [

            "shettyd@asbindia.org",
            "fisherym@asbindia.org",
            "security@asbindia.org",
            "murukatec@asbindia.org",
            "mores@asbindia.org",
            "sandbhorp@asbindia.org",
            "software@asbindia.org",
            "shindea@asbindia.org"

        ];

        document
            .getElementById(
                "loginBtn"
            )
            .addEventListener(
                "click",
                async () => {

                    try {

                        const result =
                            await signInWithPopup(
                                asbAuth,
                                asbProvider
                            );

                        const email =
                            result.user.email.toLowerCase();

                        if (
                            !allowedUsers.includes(
                                email
                            )
                        ) {

                            alert(
                                "You are not authorized to access this dashboard."
                            );

                            await signOut(
                                asbAuth
                            );

                            return;
                        }

                    }
                    catch(err){

                        console.error(err);

                        alert(
                            err.message
                        );

                    }

                }
            );

        onAuthStateChanged(
            asbAuth,
            user => {

                if (
                    user &&
                    allowedUsers.includes(
                        user.email.toLowerCase()
                    )
                ) {

                    document
                        .getElementById(
                            "loginScreen"
                        )
                        .style.display =
                        "none";

                    document
                        .getElementById(
                            "dashboardContainer"
                        )
                        .style.display =
                        "block";

                    loadDashboard();
                    loadHistory();

                }
                else {

                    document
                        .getElementById(
                            "dashboardContainer"
                        )
                        .style.display =
                        "none";

                    document
                        .getElementById(
                            "loginScreen"
                        )
                        .style.display =
                        "flex";

                }

            }
        );

    }
);


     
   
   
