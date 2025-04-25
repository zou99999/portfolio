import { fetchJSON, renderProjects, fetchGitHubData } from '/portfolio/global.js';

const allProjects = await fetchJSON('/portfolio/lib/projects.json');
const latestProjects = allProjects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');
renderProjects(latestProjects, projectsContainer, 'h2');


const githubData = await fetchGitHubData('zou99999'); // ← replace with your GitHub username

// Target the stats container
const profileStats = document.querySelector('#profile-stats');

// Render GitHub stats if the container exists
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