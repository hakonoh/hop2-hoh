import { el } from '../elements.js';
import { renderNavigation } from '../components/navigation.js';
import { fetcher } from '../fetcher.js';
import { showLecturesList } from '../namsefni.js';
import { renderContentPage } from './content-page.js';

// Helper function for creating a button container
function createButtonContainer(item, root, type) {
  const buttonContainer = el('div', { class: 'button-container' });
  const description = el('p', { class: 'button-description' }, item.text);
  const button = el('button', { class: 'button' }, item.title);

  button.addEventListener('click', async () => {
    history.pushState(null, '', `/?type=${type}&content=${item.slug}`);

    let contentJson;
    if (item.type === 'lectures') {
      const lecturesJson = await fetcher(`./data/${type}/lectures.json`);
      root.innerHTML = '';
      await showLecturesList(root, lecturesJson, type);
    } else {
      contentJson = await fetcher(`./data/${type}/${item.slug}.json`);
      root.innerHTML = '';
      await renderContentPage(root, contentJson, item.slug);
    }
  });

  buttonContainer.appendChild(description);
  buttonContainer.appendChild(button);
  return buttonContainer;
}

export async function renderSubpage(root, indexJson, type) {
  const topicJson = await fetcher(`./data/${type}/index.json`);

  const headerElement = el('header', {}, el('h1', {}, indexJson.title));
  headerElement.appendChild(renderNavigation(indexJson.navigation));

  const mainElement = el(
    'main',
    {},
    el('section', {}, el('h2', {}, topicJson.title), el('p', {}, topicJson.text)),
    el(
      'div',
      { class: 'button-section' },
      ...topicJson.content.map(item => createButtonContainer(item, root, type))
    )
  );

  const footerElement = el('footer', {}, indexJson.footer);

  root.innerHTML = ''; // Clear the root once
  root.appendChild(headerElement);
  root.appendChild(mainElement);
  root.appendChild(footerElement);
}
