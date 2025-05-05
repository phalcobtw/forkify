import { API_URL, API_KEY } from './config.js';
import { getJSON, sendJSON, sleep } from './helpers.js';
import orderBy from 'lodash/orderBy';
// Object State que usaremos como almacen de data
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: 10,
    page: 1,
  },
  bookmarks: [],
};

function createRecipeObject(data) {
  let recipe = data.data.recipe;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    // shortcircuiting si recipe.key existe entonces se asignara el atributo key con el valor recipe.key sino exitea el codigo
    ...(recipe.key && { key: recipe.key }),
  };
}

// Funcion que llama la api de los datos a usar, solo modifica nuestro object state para usarlo luego
export async function loadRecipe(id) {
  try {
    const data = await getJSON(`${API_URL}/${id}`);
    console.log(data);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @param {String} query Obtiene un string del searchView (input text)
 * @todo Modificar el orden de los state.search.results al hacer click en el button Sort
 */
/* export async function loadSearchResult(query) {
  try {
    state.search.query = query;
    const data = await getJSON(`${API_URL}?search=${query}&key=${API_KEY}`);
    state.search.results = await Promise.all(
      data.data.recipes.map(async recipe => {
        const data = await getJSON(`${API_URL}/${recipe.id}`);
        const dataRecipe = data.data.recipe;
        return {
          id: recipe.id,
          title: recipe.title,
          publisher: recipe.publisher,
          image: recipe.image_url,
          ingredients: dataRecipe.ingredients,
          ...(recipe.key && { key: recipe.key }),
        };
      })
    );
    console.log(state.search.results);
    state.search.page = 1;
  } catch (error) {
    throw error;
  }
} */
export async function loadSearchResult(query) {
  try {
    state.search.query = query;
    const data = await getJSON(`${API_URL}?search=${query}&key=${API_KEY}`);

    const recipes = data.data.recipes;
    const results = [];

    const batchSize = 5; // 🔄 Intenta 5 peticiones a la vez
    const delayBetweenBatches = 700; // ⏱️ Espera entre cada grupo

    for (let i = 0; i < recipes.length; i += batchSize) {
      const batch = recipes.slice(i, i + batchSize);
      const batchResults = await fetchRecipeDetailsBatch(batch);

      results.push(...batchResults.filter(r => r)); // Quita nulos
      await sleep(delayBetweenBatches); // Espera antes del siguiente lote
    }

    state.search.results = results;
    state.search.page = 1;
  } catch (error) {
    throw error;
  }
}
async function fetchRecipeDetailsBatch(recipesBatch) {
  return await Promise.all(
    recipesBatch.map(async recipe => {
      try {
        const detailData = await getJSON(`${API_URL}/${recipe.id}`);
        const dataRecipe = detailData.data.recipe;
        return {
          id: recipe.id,
          title: recipe.title,
          publisher: recipe.publisher,
          image: recipe.image_url,
          ingredients: dataRecipe.ingredients,
          ...(recipe.key && { key: recipe.key }),
        };
      } catch (err) {
        console.warn(`Error con la receta ${recipe.id}:`, err);
        return null; // Ignora recetas con error
      }
    })
  );
}

export function sortResults(order) {
  if (order === 'lowest') {
    state.search.results = orderBy(state.search.results, ['ingredients'], ['asc']);
  }
  if (order === 'highest') {
    state.search.results = orderBy(state.search.results, ['ingredients'], ['desc']);
  }
}

export function getSearchResultsPage(page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * 10;
  return state.search.results.slice(start, end);
}

export function updateServings(newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
}

function persistBookmarks() {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export function addBookmark(recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }
  // Se actualiza el localstorage con las nuevas bookmarks
  persistBookmarks();
}

export function deleteBookmark(id) {
  //Borrar del array de bookmarks
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  if (id === state.recipe.id) {
    state.recipe.bookmarked = false;
  }
  // Se actualiza el localstorage borrando las bookmarks que quitamos de la lista
  persistBookmarks();
}

export async function uploadRecipe(newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => {
        return entry[0].startsWith('ingredient') && entry[1] !== '';
      })
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3) throw new Error('Wrong ingredient format! Please use the correct format');
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    const data = await sendJSON(`${API_URL}?key=${API_KEY}`, recipe);
    console.log(data);

    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
}

function init() {
  // Asignamos los items en storage a una variable
  const storage = localStorage.getItem('bookmarks');
  // Si existe se asigna al state del atributo bookmarks parseado porque viene en tipo json
  if (storage) {
    state.bookmarks = JSON.parse(storage);
  }
}
init();
