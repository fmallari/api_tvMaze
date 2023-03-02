"use strict";

const MISSING_IMAGE_URL = "https://tinyurl.com/missing-tv";
const TVMAZE_API_URL = "http://api.tvmaze.com/";

const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function searchShows(query) {
  let response = await axios.get(
    `http://api.tvmaze.com/search/shows?q=${query}`);
  
  let shows = response.data.map(result => {
    let show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : MISSING_IMAGE_URL,
    };
  });

  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let $item = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img src="${show.image}" alt="${show.name}" class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($item);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

$("search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("search-query").val();
  if(!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShowws(shows);
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  let response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  let episodes = response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));
  return episode;
}


/** Given list of episodes, create markup for each and to DOM */

function populateEpisodes(episodes) {
  const $episodes = $("episodes-list");
  $episodesList.empty();

  for (let episode of episodes) {
    let $item = $(
        `<li>
         ${episode.name}
         (season ${episode.season}, episode ${episode.number})
       </li>
      `);

    $episodesList.append($item);
  }

  $episodesArea.show();
}


/** Handle click on episodes button: get episodes for show and display */

async function getEpisodesAndDisplay(evt) {
  // here's one way to get the ID of the show: search "closest" ancestor
  // with the class of .Show (which is put onto the enclosing div, which
  // has the .data-show-id attribute).
  const showId = $(evt.target).closest(".Show").data("show-id");

  // here's another way to get the ID of the show: search "closest" ancestor
  // that has an attribute of 'data-show-id'. This is called an "attribute
  // selector", and it's part of CSS selectors worth learning.
  // const showId = $(evt.target).closest("[data-show-id]").data("show-id");

  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);
