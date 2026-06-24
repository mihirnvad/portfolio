import { fetchJSON, renderProjects } from '../global.js';

const projects = (await fetchJSON('../lib/projects.json')) ?? [];

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

let query = '';
let selectedIndex = -1;
const SVG_NS = 'http://www.w3.org/2000/svg';
const colors = ['#4e79a7', '#f28e2b', '#59a14f', '#e15759', '#76b7b2', '#edc948'];

updateProjectsTitle(projects.length);

renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);

function updateProjectsTitle(count) {
  projectsTitle.textContent = `${count} Project${count === 1 ? '' : 's'}`;
}

function getFilteredProjects() {
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

function renderPieChart(projectsGiven) {
  const svg = document.querySelector('#projects-pie-plot');
  const legend = document.querySelector('.legend');

  svg.replaceChildren();
  legend.replaceChildren();

  const data = getCategoryData(projectsGiven);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return;
  }

  let startAngle = -Math.PI / 2;

  data.forEach((d, i) => {
    const endAngle = startAngle + (d.value / total) * Math.PI * 2;
    const slice = data.length === 1
      ? document.createElementNS(SVG_NS, 'circle')
      : document.createElementNS(SVG_NS, 'path');

    if (slice.tagName === 'circle') {
      slice.setAttribute('r', 50);
    } else {
      slice.setAttribute('d', describeSlice(startAngle, endAngle));
    }

    slice.setAttribute('fill', colors[i % colors.length]);
    slice.classList.toggle('selected', selectedIndex === i);
    slice.addEventListener('click', () => {
      selectedIndex = selectedIndex === i ? -1 : i;

      updateProjectsFromFilters(data);
      renderPieChart(getFilteredProjects());
    });

    svg.append(slice);
    startAngle = endAngle;
  });

  data.forEach((d, i) => {
    const item = document.createElement('li');
    const swatch = document.createElement('span');
    const count = document.createElement('em');

    item.className = selectedIndex === i ? 'legend-item selected' : 'legend-item';
    item.style.setProperty('--color', colors[i % colors.length]);

    swatch.className = 'swatch';
    count.textContent = `(${d.value})`;

    item.append(swatch, document.createTextNode(` ${d.label} `), count);
    item.addEventListener('click', () => {
      selectedIndex = selectedIndex === i ? -1 : i;

      updateProjectsFromFilters(data);
      renderPieChart(getFilteredProjects());
    });

    legend.append(item);
  });
}

function getCategoryData(projectsGiven) {
  const counts = new Map();

  for (const project of projectsGiven) {
    const category = project.category || 'Other';
    counts.set(category, (counts.get(category) || 0) + 1);
  }

  return Array.from(counts, ([label, value]) => ({ label, value }));
}

function describeSlice(startAngle, endAngle) {
  const start = getPointOnCircle(endAngle);
  const end = getPointOnCircle(startAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return `M 0 0 L ${start.x} ${start.y} A 50 50 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function getPointOnCircle(angle) {
  return {
    x: Math.cos(angle) * 50,
    y: Math.sin(angle) * 50,
  };
}

function updateProjectsFromFilters(data) {
  let filteredProjects = getFilteredProjects();

  if (selectedIndex !== -1) {
    let selectedCategory = data[selectedIndex].label;

    filteredProjects = filteredProjects.filter((project) => {
      return project.category === selectedCategory;
    });
  }

  updateProjectsTitle(filteredProjects.length);
  renderProjects(filteredProjects, projectsContainer, 'h2');
}

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  selectedIndex = -1;

  const filteredProjects = getFilteredProjects();

  updateProjectsTitle(filteredProjects.length);
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});
