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