import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

let query = '';
let selectedIndex = -1;

projectsTitle.textContent = `${projects.length} Projects`;

renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);

function getFilteredProjects() {
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

function renderPieChart(projectsGiven) {
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');

  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  const rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  const data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);

  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const arcs = arcData.map((d) => arcGenerator(d));

  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('class', selectedIndex === i ? 'selected' : '')
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;

        updateProjectsFromFilters(data);
        renderPieChart(getFilteredProjects());
      });
  });

  data.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color: ${colors(i)}`)
      .attr('class', selectedIndex === i ? 'legend-item selected' : 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;

        updateProjectsFromFilters(data);
        renderPieChart(getFilteredProjects());
      });
  });
}

function updateProjectsFromFilters(data) {
  let filteredProjects = getFilteredProjects();

  if (selectedIndex !== -1) {
    let selectedYear = data[selectedIndex].label;

    filteredProjects = filteredProjects.filter((project) => {
      return project.year === selectedYear;
    });
  }

  projectsTitle.textContent = `${filteredProjects.length} Projects`;
  renderProjects(filteredProjects, projectsContainer, 'h2');
}

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  selectedIndex = -1;

  const filteredProjects = getFilteredProjects();

  projectsTitle.textContent = `${filteredProjects.length} Projects`;
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});