console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
];

const BASE_PATH =
  (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "/"
    : "/website/";

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;

  url = !url.startsWith('http') ? BASE_PATH + url : url;

  let isCurrent =
    location.pathname === BASE_PATH + p.url;

  nav.insertAdjacentHTML(
    'beforeend',
    `<a href="${url}" class="${isCurrent ? 'current' : ''}">${p.title}</a>`
  );
}