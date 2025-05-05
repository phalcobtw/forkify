import View from './View.js';
import previewView from './previewView.js';
import icons from 'url:../../img/icons.svg';
class BookmarksView extends View {
  _errorMessage = 'No bookmarks found yet';
  _parentElement = document.querySelector('.bookmarks__list');

  _generateMarkup() {
    return this._data.map(bookmarks => previewView.render(bookmarks, false)).join('');
  }
  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }
}

export default new BookmarksView();
