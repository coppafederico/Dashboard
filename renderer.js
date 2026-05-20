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

class SemiGauge {
  constructor(canvas, options) {
    this.canvas = canvas;
    
    //needed to draw an arc
    this.ctx = canvas.getContext("2d");

    this.label = options.label;
    this.min = options.min;
    this.max = options.max;
    this.value = options.min;
    this.targetValue = options.min;

    this.segments = options.segments;

    this.isAnimating = false;

    this.draw();
  }

  setValue(newValue) {
    this.targetValue = Math.max(this.min, Math.min(this.max, newValue));

    if (!this.isAnimating) {
      this.isAnimating = true;
      requestAnimationFrame(() => this.animate());
    }
  }

  animate() {
    const difference = this.targetValue - this.value;

    this.value += difference * 0.12;

    if (Math.abs(difference) < 0.01) {
      this.value = this.targetValue;
      this.isAnimating = false;
    } else {
      requestAnimationFrame(() => this.animate());
    }

    this.draw();
  }

  valueToAngle(value) {
    const percentage = (value - this.min) / (this.max - this.min);

    const startAngle = 150;
    const endAngle = 390;

    const angle = startAngle + percentage * (endAngle - startAngle);

    //convert to radiant
    return angle * Math.PI / 180;
  }

  draw() {
  const ctx = this.ctx;
  const width = this.canvas.width;
  const height = this.canvas.height;

  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;

  const centerY = 120;

  const radius = 70;

  this.drawLabel(ctx, centerX);
  this.drawSegments(ctx, centerX, centerY, radius);
  this.drawTicks(ctx, centerX, centerY, radius);
  this.drawPointer(ctx, centerX, centerY, radius);
  this.drawValue(ctx, centerX, centerY);
}

  drawLabel(ctx, centerX) {
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.label, centerX, 18);
  }

  drawSegments(ctx, centerX, centerY, radius) {
    ctx.lineWidth = 8;
    ctx.lineCap = "round";

    this.segments.forEach(segment => {
      const startAngle = this.valueToAngle(segment.from);
      const endAngle = this.valueToAngle(segment.to);

      ctx.beginPath();
      ctx.strokeStyle = segment.color;
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.stroke();
    });
  }

  drawTicks(ctx, centerX, centerY, radius) {
    ctx.strokeStyle = "#6a6a6a";
    ctx.lineWidth = 2;

    const ticks = 28;

    for (let i = 0; i <= ticks; i++) {
      const value = this.min + (i / ticks) * (this.max - this.min);
      const angle = this.valueToAngle(value);

      const innerRadius = radius - 14;
      const outerRadius = radius - 8;

      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;

      const x2 = centerX + Math.cos(angle) * outerRadius;
      const y2 = centerY + Math.sin(angle) * outerRadius;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  drawPointer(ctx, centerX, centerY, radius) {
    const angle = this.valueToAngle(this.value);

    const pointerRadius = radius;
    const x = centerX + Math.cos(angle) * pointerRadius;
    const y = centerY + Math.sin(angle) * pointerRadius;

    ctx.beginPath();
    ctx.fillStyle = "#5b83c7";
    ctx.strokeStyle = "#9bb6e8";
    ctx.lineWidth = 2;
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  drawValue(ctx, centerX, centerY) {
    ctx.fillStyle = "#555";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(Math.round(this.value), centerX, centerY - 10);
  }
}

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