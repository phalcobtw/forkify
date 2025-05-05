import * as model from '../js/model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// NEW API URL (instead of the one shown in the video)
// https://forkify-api.jonas.io

///////////////////////////////////////
async function controlRecipes() {
  try {
    // OBTENEMOS EL VALOR DEL HASH QUITANDO EL "#"
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // 1) Loading Recipe
    // Await porque regresa un promise, y asi concretamos que modifique el state object del model
    await model.loadRecipe(id);
    // Usamos el object state con los datos de recipe
    let recipe = model.state.recipe;

    // 2) Rendering the recipe
    recipeView.render(recipe);
  } catch (error) {
    recipeView.renderError();
  }
}

async function controlSearchResults() {
  try {
    resultsView.renderSpinner();

    const query = searchView.getQuery();
    if (!query) return;

    await model.loadSearchResult(query);

    resultsView.render(model.getSearchResultsPage());

    // Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (error) {}
}

function controlPagination(goToPage) {
  // Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));
  // Render paginaton buttons
  paginationView.render(model.state.search);
}

function controlServings(newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);
  // Update the recipe view
  recipeView.update(model.state.recipe);
}

function controlAddBookmark() {
  // Add or remove bookmarks
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }
  // Update the view (update bookmark button)
  recipeView.update(model.state.recipe);

  // Render bookmarks list
  bookmarksView.render(model.state.bookmarks);
}

function controlBookmarks() {
  bookmarksView.render(model.state.bookmarks);
}

async function controlAddRecipe(newRecipe) {
  try {
    // Upload the recipe data
    await model.uploadRecipe(newRecipe);
    // Render recipe
    recipeView.render(model.state.recipe);

    // Close form window
    addRecipeView.toggleWindow();

    // Render bookmarks
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
  } catch (error) {
    console.log(error);
    addRecipeView.renderError(error.message);
  }
}

function controlSortRecipes(order) {
  model.sortResults(order);
  resultsView.render(model.getSearchResultsPage(1), true);
  paginationView.render(model.state.search);
}

function init() {
  // Listening for load al no tener un hash y escuchamos por un cambio en el hash con hashchange para cuando cambiemos de recetas
  recipeView.addHandlerRender(controlRecipes);
  searchView.addHandlerSearch(controlSearchResults);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  paginationView.addHandlerClick(controlPagination);
  recipeView.addHandlerUpdateServings(controlServings);
  bookmarksView.addHandlerRender(controlBookmarks);
  addRecipeView._addHandlerUpload(controlAddRecipe);
  resultsView.addHandlerSort(controlSortRecipes);
}

init();
