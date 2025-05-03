import { fetchJSON, renderProjects } from '/portfolio/global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const allProjects = await fetchJSON('/portfolio/lib/projects.json');
let query = '';
let selectedIndex = -1;
let currentPieData = [];

const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');

// Initial render
applyFilters();

// Handle search input
searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();
  applyFilters();
});

// Master filter + render function
function applyFilters() {
  let filtered = allProjects;

  // 1. Search filter
  if (query !== '') {
    filtered = filtered.filter((project) => {
      const values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query);
    });
  }

  // 2. Year (pie chart) filter
  if (selectedIndex !== -1 && currentPieData[selectedIndex]) {
    const selectedYear = currentPieData[selectedIndex].label;
    filtered = filtered.filter((p) => String(p.year) === String(selectedYear));
  }

  renderProjects(filtered, projectsContainer, 'h2');
  renderPieChart(filtered);
}

// Pie chart renderer
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

  let data = rolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));
  currentPieData = data;

  // ✅ Add dummy slice to avoid full circle
  if (data.length === 1) {
    data.push({ label: '__invisible__', value: 0.0001 });
  }

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
    .filter((d) => d.data.label !== '__invisible__') // ✅ skip dummy
    .attr('d', arcGenerator)
    .attr('fill', (_, i) => colors(i))
    .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''))
    .on('click', function (_, d) {
      const index = d3.select(this).datum().index;
      selectedIndex = selectedIndex === index ? -1 : index;
      applyFilters();
    });

  // Legend
  legend
    .selectAll('li')
    .data(data.filter((d) => d.label !== '__invisible__')) // ✅ no dummy in legend
    .enter()
    .append('li')
    .attr('style', (_, i) => `--color:${colors(i)}`)
    .attr('class', (_, i) => (i === selectedIndex ? 'legend-item selected' : 'legend-item'))
    .html((d) => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
    .on('click', function (_, d) {
      const index = d3.select(this).datum().index;
      selectedIndex = selectedIndex === index ? -1 : index;
      applyFilters();
    });
}
