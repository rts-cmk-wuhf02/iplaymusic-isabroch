// Imports
import observe from "./observe.js";
import encodeParams from "./encodeParams.js";
import randSample from "./randomFromArray.js";

// FETCH
function auth() {
  if (window.localStorage.getItem('token')) {
    const authentication = window.localStorage.getItem('token');

    return authentication;
  }

  if (window.location.hash) {
    // url is returned with #, this creates search params by giving a query WITHOUT #
    const params = new URLSearchParams(window.location.hash.substring(1));

    // calling spotify api requires authetnication
    const authentication = `${params.get('token_type')} ${params.get('access_token')}`;

    // create local storage item to remember token
    window.localStorage.setItem('token', authentication)

    // 'cleans' the url
    window.location.href = window.location.origin;

    return authentication;
  }

  const paramString = encodeParams({
    'client_id': '26253e9f95d948378e1e70d9552a6efa',
    'response_type': 'token',
    'redirect_uri': window.location.href
  });

  window.location.href = `https://accounts.spotify.com/authorize?${paramString}`;
}

( async function getData() {
  const token = await auth();

  xfetch.init({
    address: "https://api.spotify.com/v1/",
    key: token
  });

  const playlists = (await xfetch.get(`search?q=%22music%22&type=playlist&limit=10`)).playlists.items;

  console.log(playlists);

  const featuredItems = []

  for (const item of playlists) {
    featuredItems.push(
      {
        name: item.name,
        type: item.type,
        id: item.id,
        img: item.images[0].url
      }
    )
  }

  createCards(featuredItems);
} )();

function createCards(items) {
  for (const item of items) {
    const cardContainer = document.querySelector('.featured-card-grid');
    const cardTemplate = document.querySelector('#feature-card');
    const cardClone = cardTemplate.content.cloneNode(true);

    const cardFields = ['.feature-card__title', '.feature-card__type', '.feature-card__link', '.feature-card__background'].map(query => cardClone.querySelector(query));

    cardFields[0].textContent = item.name;
    cardFields[1].textContent = item.type;
    cardFields[2].href = `/playlists?id=${item.id}`;
    cardFields[3].dataset.image = item.img;

    cardContainer.appendChild(cardClone);
  }

  observe(
    ['.feature-card__background'],
    function (el) {
      el.style = `--card-bg: url(${el.dataset.image})`;
    },
    true,
    '0px 0px 50% 0px'
  );
}