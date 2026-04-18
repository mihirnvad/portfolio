console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a");

navLinks.forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add("current");
  }
});