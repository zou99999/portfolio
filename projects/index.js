import { fetchJSON, renderProjects, fetchGitHubData } from '/portfolio/global.js';
import { drawPieChart } from './projects.js';

// ✅ Fetch all projects
const projects = await fetchJSON('/portfolio/lib/projects.json');

// ✅ Render all projects
const container = document.querySelector('.projects-list');
renderProjects(projects, container, 'h2');

// ✅ Draw the pie chart
drawPieChart(projects);

// ✅ GitHub stats
const githubData = await fetchGitHubData('zou99999');
const profileStats = document.querySelector('#profile-stats');

if (profileStats && githubData) {
  profileStats.innerHTML = `
    <h2>GitHub Stats</h2>
    <dl class="github-grid">
      <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
      <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
      <dt>Followers:</dt><dd>${githubData.followers}</dd>
      <dt>Following:</dt><dd>${githubData.following}</dd>
    </dl>
  `;
}