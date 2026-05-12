function generateFakeTelemetryData() {
  // Generates random telemetry values for the dashboard prototype.
  return {
    speed: Math.floor(Math.random() * 120),
    rpm: Math.floor(3000 + Math.random() * 9000),
    throttle: Math.floor(Math.random() * 100),
    brake: Math.floor(Math.random() * 100),
    batteryTemp: (30 + Math.random() * 25).toFixed(1)
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

// Updates the dashboard every second with simulated data.
setInterval(() => {
  const data = generateFakeTelemetryData();
  updateDashboard(data);
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