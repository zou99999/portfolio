console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

//const navLinks = $$("nav a");

//const currentLink = navLinks.find(
  //(a) => a.host === location.host && a.pathname === location.pathname
//);

//if (currentLink) {
  //currentLink.classList.add("current");
//}


let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'resume/', title: 'Resume' },
  { url: 'contact/', title: 'Contact' },
  { url:'https://github.com/zou99999', title: 'GitHub'},
];

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/portfolio/";         // GitHub Pages repo name

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  
  // Add BASE_PATH to relative URLs
  url = !url.startsWith('http') ? BASE_PATH + url : url;

  // Create link and add it to nav
  let a = document.createElement('a');
    a.href = url;
  a.textContent = title;

  // Highlight current page
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );

  // Open external links in a new tab
  a.toggleAttribute(
    'target',
    a.host !== location.host
  );

  nav.append(a);
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);


let select = document.querySelector('.color-scheme select');

// Step 1: Define a reusable function
function setColorScheme(scheme) {
  document.documentElement.style.setProperty('color-scheme', scheme);
  localStorage.colorScheme = scheme;
  select.value = scheme;
}

// Step 2: On page load, check if user has a saved preference
if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

// Step 3: When the user changes the dropdown, update everything
select.addEventListener('input', function (event) {
  setColorScheme(event.target.value);
});