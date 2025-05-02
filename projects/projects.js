import { fetchJSON, renderProjects } from '/portfolio/global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('/portfolio/lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
  projectsTitle.textContent += ` (${projects.length} projects)`;
}


const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Step 3: Prepare data
const data = [1, 2, 3, 4, 5, 5];

// Step 4: Generate slice angles using d3.pie()
const sliceGenerator = d3.pie();
const arcData = sliceGenerator(data);

// Step 5: Map arcData into SVG path strings
const arcs = arcData.map((d) => arcGenerator(d));

// Step 6: Create color scale
const colors = d3.scaleOrdinal(d3.schemeTableau10);

// Step 7: Draw SVG and append paths
const svg = d3
  .select('#projects-plot') // make sure your HTML has <svg id="projects-plot">
  .attr('viewBox', '-50 -50 100 100');

arcs.forEach((arc, idx) => {
  svg
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(idx));
});