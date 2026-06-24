console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home'},
  { url: 'projects/', title: 'Projects'},
  { url: 'contact/', title: 'Contact'},
  { url: 'resume/', title: 'Resume'},
  { url: 'https://github.com/mihirnvad', title: 'Github'},
  { url : 'meta/', title: 'Meta'}
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

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
    return null;
  }
}

function sanitizeClassName(value) {
  return String(value || 'project')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function createProjectVisual(project) {
  const visualName = sanitizeClassName(project.visual || project.category);
  const figure = document.createElement('figure');

  figure.className = `project-visual project-visual--${visualName}`;
  figure.setAttribute('role', 'img');
  figure.setAttribute(
    'aria-label',
    `${project.title} visual preview for ${project.category || 'portfolio work'}`
  );

  for (const mark of ['primary', 'secondary', 'tertiary', 'quaternary']) {
    const span = document.createElement('span');
    span.className = `project-visual__mark project-visual__mark--${mark}`;
    figure.append(span);
  }

  const caption = document.createElement('figcaption');
  caption.className = 'project-visual__label';
  caption.textContent = project.category || 'Project';
  figure.append(caption);

  return figure;
}

function createProjectMedia(project) {
  if (project.image) {
    const image = document.createElement('img');
    image.src = project.image;
    image.alt = project.imageAlt || `${project.title} preview`;
    image.loading = 'lazy';
    return image;
  }

  return createProjectVisual(project);
}

function appendList(items, className, containerElement) {
  if (!Array.isArray(items) || items.length === 0) {
    return;
  }

  const list = document.createElement('ul');
  list.className = className;

  for (const item of items) {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    list.append(listItem);
  }

  containerElement.append(list);
}

function appendProjectLink(project, containerElement) {
  if (!project.url) {
    return;
  }

  const link = document.createElement('a');
  link.className = 'project-link';
  link.href = project.url;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = 'View repository';

  containerElement.append(link);
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
    const body = document.createElement('div');
    const heading = document.createElement(headingLevel);
    const meta = document.createElement('p');
    const repo = document.createElement('p');
    const description = document.createElement('p');

    article.className = 'project-card';
    body.className = 'project-card__body';

    heading.textContent = project.title;

    meta.className = 'project-card__meta';
    meta.textContent = [project.year, project.category].filter(Boolean).join(' / ');

    repo.className = 'project-card__repo';
    repo.textContent = project.repo ? `GitHub: ${project.repo}` : '';

    description.className = 'project-card__description';
    description.textContent = project.description;

    body.append(heading, meta);

    if (project.repo) {
      body.append(repo);
    }

    body.append(description);
    appendList(project.highlights, 'project-highlights', body);
    appendList(project.tools, 'project-tools', body);
    appendProjectLink(project, body);

    article.append(createProjectMedia(project), body);
    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}
