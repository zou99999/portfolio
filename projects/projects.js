import { fetchJSON, renderProjects, fetchGitHubData } from '/portfolio/global.js';

const projects = await fetchJSON('/portfolio/lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
  projectsTitle.textContent += ` (${projects.length} projects)`;
}
