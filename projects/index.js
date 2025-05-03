import { fetchJSON, renderProjects } from '/portfolio/global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const allProjects = await fetchJSON('/portfolio/lib/projects.json');
let query = '';
let selectedIndex = -1;
let currentPieData = [];

const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');

applyFilters(); // Initial render

// Input event for search bar
searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();
  applyFilters();
});

// Apply both search + pie filters
function applyFilters() {
  let filtered = allProjects;

  // 1. Search filter
  if (query !== '') {
    filtered = filtered.filter((project) => {
      const values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query);
    });
  }

  // 2. Pie chart (year) filter
  if (selectedIndex !== -1 && currentPieData.length > selectedIndex) {
    const selectedYear = currentPieData[selectedIndex].label;
    filtered = filtered.filter((p) => p.year === selectedYear);
  }
  

  renderProjects(filtered, projectsContainer, 'h2');
  renderPieChart(filtered);
}

// Pie chart rendering
function renderPieChart(projectsGiven) {
  const svg = d3.select('#projects-plot');
  svg.selectAll('path').remove();

  const legend = d3.select('.legend');
  legend.selectAll('li').remove();

  const rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  const data = rolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));
  currentPieData = data; // <- store for access in applyFilters()
  

  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  // Pie wedges
  svg
    .selectAll('path')
    .data(arcData)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (_, i) => colors(i))
    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''))
    .on('click', (_, i) => {
      selectedIndex = selectedIndex === i ? -1 : i;
      applyFilters();
    });

  // Legend
  legend
    .selectAll('li')
    .data(data)
    .enter()
    .append('li')
    .attr('style', (_, i) => `--color:${colors(i)}`)
    .attr('class', (_, i) => (i === selectedIndex ? 'legend-item selected' : 'legend-item'))
    .html((d) => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
    .on('click', (_, i) => {
      selectedIndex = selectedIndex === i ? -1 : i;
      applyFilters();
    });
}
