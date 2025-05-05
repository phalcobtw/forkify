import View from './View.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  _generateMarkup() {
    const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);

    // Page 1, and there are other pages
    if (+this._data.page === 1 && numPages > 1) {
      return `
          <span class="hidden"></span>
          <span class="pagination__current">${+this._data.page} / ${+numPages}</span>
          <button data-goto="${+this._data.page + 1}" class="btn--inline pagination__btn--next">
            <span>Page ${+this._data.page + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </button>`;
    }
    //Last page
    if (+this._data.page === numPages && numPages > 1) {
      return `<button data-goto="${+this._data.page - 1}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${+this._data.page - 1}</span>
          </button>
          <span class="pagination__current">${+this._data.page} / ${+numPages}</span>`;
    }
    //Other page between
    if (+this._data.page < numPages) {
      return `<button data-goto="${+this._data.page - 1}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${+this._data.page - 1}</span>
          </button>
          <span class="pagination__current">${+this._data.page} / ${+numPages}</span>
          <button data-goto="${+this._data.page + 1}" class="btn--inline pagination__btn--next">
            <span>Page ${+this._data.page + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </button>`;
    }
    //Page 1, and there are no other pages
    return ``;
  }

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      const goToPage = btn.dataset.goto;

      handler(goToPage);
    });
  }
}

export default new PaginationView();
