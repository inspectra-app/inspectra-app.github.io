const navigation = document.querySelector('#site-nav');
const toggle = document.querySelector('.nav-toggle');

toggle?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('#site-nav a').forEach((link) => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
}));

const toast = document.querySelector('.toast');
let toastTimer;
document.querySelectorAll('[data-notice]').forEach((button) => button.addEventListener('click', () => {
  window.clearTimeout(toastTimer);
  toast.textContent = button.dataset.notice;
  toast.classList.add('show');
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 4300);
}));

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const curveData = [
  { month: 'Ene', planned: 3, executed: 2 },
  { month: 'Feb', planned: 7, executed: 5 },
  { month: 'Mar', planned: 13, executed: 9 },
  { month: 'Abr', planned: 20, executed: 15 },
  { month: 'May', planned: 29, executed: 21 },
  { month: 'Jun', planned: 40, executed: 29 },
  { month: 'Jul', planned: 53, executed: 38 },
  { month: 'Ago', planned: 67, executed: 48 },
  { month: 'Sep', planned: 79, executed: 59 },
  { month: 'Oct', planned: 88, executed: 67 },
  { month: 'Nov', planned: 95, executed: 77 },
  { month: 'Dic', planned: 100, executed: 86 },
];

const curve = document.querySelector('#s-curve');
if (curve) {
  const ns = 'http://www.w3.org/2000/svg';
  const chart = { left: 58, right: 630, top: 34, bottom: 262 };
  const pointAt = (index, value) => ({
    x: chart.left + ((chart.right - chart.left) * index) / (curveData.length - 1),
    y: chart.bottom - ((chart.bottom - chart.top) * value) / 100,
  });
  const pathFor = (key) => curveData.map((item, index) => {
    const point = pointAt(index, item[key]);
    return `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }).join(' ');
  const plannedPath = pathFor('planned');
  const areaPath = `${plannedPath} L${chart.right} ${chart.bottom} L${chart.left} ${chart.bottom} Z`;
  document.querySelector('#curve-planned').setAttribute('d', plannedPath);
  document.querySelector('#curve-executed').setAttribute('d', pathFor('executed'));
  document.querySelector('#curve-area-path').setAttribute('d', areaPath);

  const labels = document.querySelector('#curve-labels');
  curveData.forEach((item, index) => {
    const point = pointAt(index, 0);
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('class', 'curve-x-label');
    text.setAttribute('x', point.x);
    text.setAttribute('y', '285');
    text.setAttribute('text-anchor', 'middle');
    text.textContent = item.month;
    labels.appendChild(text);
  });

  const months = document.querySelector('#curve-months');
  const points = document.querySelector('#curve-points');
  const tooltip = document.querySelector('#curve-tooltip');
  const plannedValue = document.querySelector('#planned-value');
  const executedValue = document.querySelector('#executed-value');
  const varianceValue = document.querySelector('#variance-value');
  let selectedIndex = 8;

  const selectMonth = (index) => {
    selectedIndex = index;
    const item = curveData[index];
    const point = pointAt(index, item.planned);
    const actualPoint = pointAt(index, item.executed);
    const cut = document.querySelector('#curve-cut-line');
    cut.setAttribute('x1', point.x);
    cut.setAttribute('x2', point.x);
    cut.setAttribute('y1', chart.top);
    cut.setAttribute('y2', chart.bottom);
    plannedValue.textContent = `${item.planned.toFixed(1)} %`;
    executedValue.textContent = `${item.executed.toFixed(1)} %`;
    const variance = item.executed - item.planned;
    varianceValue.textContent = `${variance > 0 ? '+' : ''}${variance.toFixed(1)} pp`;
    tooltip.innerHTML = `<strong>${item.month} · demostración</strong>Programado: ${item.planned.toFixed(1)} %<br />Ejecutado: ${item.executed.toFixed(1)} %`;
    tooltip.style.left = `${(point.x / 660) * 100}%`;
    tooltip.style.top = `${(Math.min(point.y, actualPoint.y) / 330) * 100}%`;
    tooltip.classList.add('show');
    window.setTimeout(() => tooltip.classList.remove('show'), 3100);
    months.querySelectorAll('button').forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(buttonIndex === index)));
  };

  curveData.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.month;
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `Seleccionar ${item.month}, datos de demostración`);
    button.addEventListener('click', () => selectMonth(index));
    months.appendChild(button);
    ['planned', 'executed'].forEach((key) => {
      const point = pointAt(index, item[key]);
      const circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('class', `curve-point ${key}-point`);
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
      circle.setAttribute('r', index === selectedIndex ? '5' : '3.5');
      circle.setAttribute('tabindex', '0');
      circle.setAttribute('role', 'button');
      circle.setAttribute('aria-label', `${item.month}: ${key === 'planned' ? 'programado' : 'ejecutado'} ${item[key]} %`);
      circle.addEventListener('click', () => selectMonth(index));
      circle.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectMonth(index); } });
      points.appendChild(circle);
    });
  });
  selectMonth(selectedIndex);
}
