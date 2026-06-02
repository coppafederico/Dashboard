import { SemiGauge, TimeSeriesChart } from './classes.js';

function generateFakeTelemetryData() {
  // Generates random telemetry values for the dashboard prototype.
  return {
    speed: Math.floor(Math.random() * 120),
    rpm: Math.floor(3000 + Math.random() * 9000),
    throttle: Math.floor(Math.random() * 100),
    brake: Math.floor(Math.random() * 100),
    batteryTemp: (30 + Math.random() * 25).toFixed(1),

    fuel_pressure: Math.random() * 6,
    engine_oil_pressure: Math.random() * 6,
    battery_voltage: Math.random() * 6,
    engine_speed: Math.floor(Math.random() * 13500)
  };
}

function updateDashboard(data) {
  // Updates the dashboard values shown in the HTML page.
  document.getElementById('speed').textContent = data.speed;
  document.getElementById('rpm').textContent = data.rpm;
  document.getElementById('throttle').textContent = data.throttle;
  document.getElementById('brake').textContent = data.brake;
  document.getElementById('batteryTemp').textContent = data.batteryTemp;
}

const lowRangeChart = new TimeSeriesChart(
  document.getElementById("lowRangeChart"),
  {
    minY: 0,
    maxY: 6,
    labels: [0, 1, 2, 3, 4, 5, 6],
    maxPoints: 80,
    datasets: {
      fuel_pressure: { color: "#00aaff" },
      engine_oil_pressure: { color: "#ff2222" },
      battery_voltage: { color: "#ff00cc" }
    }
  }
);

const highRangeChart = new TimeSeriesChart(
  document.getElementById("highRangeChart"),
  {
    minY: 0,
    maxY: 13500,
    labels: [0, 3000, 6000, 9000, 12000, 13500],
    maxPoints: 80,
    datasets: {
      engine_speed: { color: "#00ff33" }
    }
  }
);

function updateCharts(data) {
  lowRangeChart.addData(data);
  highRangeChart.addData(data);
}

// Updates the dashboard every second with simulated data.
setInterval(() => {
  const data = generateFakeTelemetryData();
  updateDashboard(data);
  updateCharts(data);
}, 1000);

const fuelPressureGauge = new SemiGauge(
  document.getElementById("fuelPressureGauge"),
  {
    label: "Fuel Pressure",
    min: 0,
    max: 100,
    segments: [
      { from: 0, to: 20, color: "#1d4cff" },
      { from: 20, to: 40, color: "#24d943" },
      { from: 40, to: 60, color: "#ffe600" },
      { from: 60, to: 80, color: "#ff4a1c" },
      { from: 80, to: 100, color: "#641b09" }
    ]
  }
);

const oilPressureGauge = new SemiGauge(
  document.getElementById("oilPressureGauge"),
  {
    label: "Oil Pressure",
    min: 0,
    max: 10,
    segments: [
      { from: 0, to: 2, color: "#ff4a1c" },
      { from: 2, to: 4, color: "#24d943" },
      { from: 4, to: 6, color: "#1d4cff" },
      { from: 6, to: 8, color: "#1a1138" },
      { from: 8, to: 10, color: "#525664" }
    ]
  }
);

const engineSpeedGauge = new SemiGauge(
  document.getElementById("engineSpeedGauge"),
  {
    label: "Engine Speed",
    min: 0,
    max: 8000,
    segments: [
      { from: 0, to: 1600, color: "#1d4cff" },
      { from: 1600, to: 3200, color: "#24d943" },
      { from: 3200, to: 4800, color: "#ffe600" },
      { from: 4800, to: 6400, color: "#ff4a1c" },
      { from: 6400, to: 8000, color: "#3b2a0a" }
    ]
  }
);

const batteryVoltageGauge = new SemiGauge(
  document.getElementById("batteryVoltageGauge"),
  {
    label: "Battery Voltage",
    min: 0,
    max: 25,
    segments: [
      { from: 0, to: 5, color: "#ff4a1c" },
      { from: 5, to: 10, color: "#ffe600" },
      { from: 10, to: 15, color: "#24d943" },
      { from: 15, to: 20, color: "#244ab1" },
      { from: 20, to: 25, color: "#4b142f" }
    ]
  }
);

setInterval(() => {
  fuelPressureGauge.setValue(Math.random() * 100);
  oilPressureGauge.setValue(Math.random() * 10);
  engineSpeedGauge.setValue(Math.random() * 8000);
  batteryVoltageGauge.setValue(Math.random() * 24);
}, 1000);

// Gets the configuration dialog elements from the HTML page.
const configDialog = document.getElementById('config-dialog');
const configForm = document.getElementById('config-form');
const configIpInput = document.getElementById('config-ip');
const configPortInput = document.getElementById('config-port');
const configMessage = document.getElementById('config-message');
const closeConfigButton = document.getElementById('close-config');

async function openConfigDialog() {
  // Gets the current configuration from main.js.
  const config = await window.electronAPI.getConfig();

  configIpInput.value = config.ip;
  configPortInput.value = config.port;
  configMessage.textContent = '';

  configDialog.showModal();
}

function closeConfigDialog() {
  configDialog.close();
}

window.electronAPI.onOpenConfigPage(() => {
  openConfigDialog();
});

configForm.addEventListener('submit', async (event) => {
  // Prevents the form from reloading the page.
  event.preventDefault();

  const savedConfig = await window.electronAPI.saveConfig({
    ip: configIpInput.value,
    port: configPortInput.value
  });

  configMessage.textContent = `Saved: ${savedConfig.ip}:${savedConfig.port}`;
});

closeConfigButton.addEventListener('click', () => {
  closeConfigDialog();
});