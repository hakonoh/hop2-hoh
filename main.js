import { fetcher } from './lib/fetcher.js';
import { renderIndexPage } from './lib/pages/index-page.js';
import { renderContentPage } from './lib/pages/content-page.js';
import { renderSubpage } from './lib/pages/sub-page.js';
import { showLecturesList, showLectureDetail } from './lib/namsefni.js';

async function render(root, querystring) {
  try {
    console.log("Rendering page with query:", querystring);

    const mainIndexJson = await fetcher('./data/index.json');
    const params = new URLSearchParams(querystring);
    const type = params.get('type') || '';
    const content = params.get('content');
    const lectureSlug = params.get('lecture');

    root.innerHTML = '';  // Clear root before rendering

    if (!type) {
      return renderIndexPage(root, mainIndexJson);  // Render main index page
    }

    const normalizedType = type === 'javascript' ? 'js' : type;

    if (content === 'lectures') {
      const lecturesJson = await fetcher(`./data/${normalizedType}/lectures.json`);
      
      if (lectureSlug) {
        const lecture = lecturesJson.lectures.find((l) => l.slug === lectureSlug);
        if (lecture) {
          return showLectureDetail(root, lecture);  // Render specific lecture
        }
      }
      
      return showLecturesList(root, lecturesJson, normalizedType);  // Render lectures list
    }

    if (content) {
      const contentJson = await fetcher(`./data/${normalizedType}/${content}.json`);
      return renderContentPage(root, mainIndexJson, contentJson, content);  // Render content page
    }

    return renderSubpage(root, mainIndexJson, normalizedType);  // Render subpage
  } catch (error) {
    console.error("Render error:", error);
    root.innerHTML = '<p>Something went wrong while loading the page.</p>';  // Fallback error message
  }
}

const root = document.querySelector('#app');
render(root, window.location.search);

window.addEventListener('popstate', () => render(root, window.location.search));

document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link && link.getAttribute('href')) {
    const href = link.getAttribute('href');

    if (href === '/') {
      e.preventDefault();
      history.pushState(null, '', '/');
      render(root, '');
    } else if (href.startsWith('/')) {
      e.preventDefault();
      const url = new URL(link.href);
      if (window.location.search !== url.search) {
        history.pushState(null, '', url.search);
        render(root, url.search);
      }
    }
  }
});
