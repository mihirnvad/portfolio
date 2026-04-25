console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home'},
  { url: 'projects/', title: 'Projects'},
  { url: 'contact/', title: 'Contact'},
  { url: 'resume/', title: 'Resume'},
  { url: 'https://github.com/mihirnvad', title: 'Github'}
];

const BASE_PATH =
  (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "/"
    : "/portfolio/";

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="theme-select">
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

const select = document.querySelector("#theme-select");

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}

if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

select.addEventListener('input', function (event) {
  const value = event.target.value;

  setColorScheme(value);
  localStorage.colorScheme = value;
});


let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;

  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

  let a = document.createElement('a');
  a.href = url;
  a.textContent = p.title;

  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  if (a.host !== location.host) {
    a.target = '_blank';
  }

  nav.append(a);
}

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);

    console.log(response);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!containerElement) {
    console.error('Invalid container element');
    return;
  }

  if (!Array.isArray(projects)) {
    console.error('Projects data must be an array');
    return;
  }

  const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

  if (!validHeadings.includes(headingLevel)) {
    console.error('Invalid heading level');
    headingLevel = 'h2';
  }

  containerElement.innerHTML = '';

  for (const project of projects) {
    const article = document.createElement('article');

    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <p>${project.description}</p>
    `;

    containerElement.appendChild(article);
  }
}