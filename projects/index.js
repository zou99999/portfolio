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

  // Search filter
  if (query !== '') {
    filtered = filtered.filter((project) => {
      const values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query);
    });
  }

  // Year filter
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

  const data = rolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));
  currentPieData = data;

  // Create dummy entry if only one wedge
  let dataToDraw = data.length === 1
    ? [...data, { value: 0.0001, label: '__dummy__' }]
    : data;

  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGenerator = d3.pie().value(d => d.value);
  const arcData = sliceGenerator(dataToDraw);
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  // Draw pie wedges
  svg.selectAll('path')
    .data(arcData)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (d, i) =>
      d.data.label === '__dummy__' ? 'transparent' : colors(i)
    )
    .attr('class', (d, i) =>
      d.data.label === '__dummy__' ? '' :
      (i === selectedIndex ? 'selected' : '')
    )
    .style('cursor', (d) =>
      d.data.label === '__dummy__' ? 'default' : 'pointer'
    )
    .on('click', function (event, d) {
      if (d.data.label === '__dummy__') return;
      const index = arcData.indexOf(d);
      selectedIndex = selectedIndex === index ? -1 : index;
      applyFilters();
    });

  // Legend (exclude dummy)
  legend.selectAll('li')
    .data(data)
    .enter()
    .append('li')
    .attr('style', (_, i) => `--color:${colors(i)}`)
    .attr('class', (_, i) =>
      i === selectedIndex ? 'legend-item selected' : 'legend-item'
    )
    .html(d => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
    .on('click', function (_, d) {
      const index = data.findIndex(e => e.label === d.label);
      selectedIndex = selectedIndex === index ? -1 : index;
      applyFilters();
    });
}
