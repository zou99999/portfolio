import { fetchJSON, renderProjects } from '/portfolio/global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const allProjects = await fetchJSON('/portfolio/lib/projects.json');
let query = '';
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');

// Initial render
renderProjects(allProjects, projectsContainer, 'h2');
renderPieChart(allProjects);

// Handle input changes
searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();

  const filteredProjects = allProjects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query);
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});

// Refactor pie chart rendering into a reusable function
function renderPieChart(projectsGiven) {
  // Clear existing paths and legends
  d3.select('#projects-plot').selectAll('path').remove();
  d3.select('.legend').selectAll('li').remove();

  // Roll and prepare data
  const rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  const data = rolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  const svg = d3.select('#projects-plot');

  svg
    .selectAll('path')
    .data(arcData)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (_, i) => colors(i));

  const legend = d3.select('.legend');
  data.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(i)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}
