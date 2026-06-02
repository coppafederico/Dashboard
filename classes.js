export class SemiGauge {
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

export class TimeSeriesChart {
  constructor(canvas, options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.minY = options.minY;
    this.maxY = options.maxY;
    this.labels = options.labels;
    this.maxPoints = options.maxPoints ?? 80;
    this.datasets = options.datasets;

    Object.values(this.datasets).forEach(dataset => {
      dataset.values = [];
    });
  }

  addData(data) {
    Object.entries(this.datasets).forEach(([key, dataset]) => {
      dataset.values.push(data[key] ?? 0);

      if (dataset.values.length > this.maxPoints) {
        dataset.values.shift();
      }
    });

    this.draw();
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  draw() {
    this.resizeCanvas();

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const paddingLeft = 65;
    const paddingRight = 20;
    const paddingTop = 10;
    const paddingBottom = 15;

    ctx.clearRect(0, 0, w, h);

    this.labels.forEach(value => {
      const y = paddingTop + (1 - (value - this.minY) / (this.maxY - this.minY)) * (h - paddingTop - paddingBottom);

      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(w - paddingRight, y);
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#ddd";
      ctx.font = "12px Arial";
      ctx.textAlign = "right";
      ctx.fillText(value.toLocaleString(), paddingLeft - 10, y + 4);
    });

    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop);
    ctx.lineTo(paddingLeft, h - paddingBottom);
    ctx.lineTo(w - paddingRight, h - paddingBottom);
    ctx.stroke();

    Object.values(this.datasets).forEach(dataset => {
      ctx.beginPath();
      ctx.strokeStyle = dataset.color;
      ctx.lineWidth = 2;

      dataset.values.forEach((value, index) => {
        const x = paddingLeft + index * ((w - paddingLeft - paddingRight) / (this.maxPoints - 1));
        const y = paddingTop + (1 - (value - this.minY) / (this.maxY - this.minY)) * (h - paddingTop - paddingBottom);

        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
    });
  }
}