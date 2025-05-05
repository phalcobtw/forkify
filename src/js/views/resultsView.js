import previewView from './previewView.js';
import View from './View.js';
import icons from 'url:../../img/icons.svg';
class ResultsView extends View {
  _errorMessage = 'No recipes found for your query';
  _parentElement = document.querySelector('.results');

  _generateMarkup() {
    return this._data.map(result => previewView.render(result, false)).join('');
  }

  addHandlerSort(handler) {
    document.querySelector('.container-sort').addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--sort');
      if (!btn) return;
      handler(btn.classList[1]);
    });
  }
}

export default new ResultsView();
