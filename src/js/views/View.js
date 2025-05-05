import icons from 'url:../../img/icons.svg';
import Fraction from 'fraction.js';
export default class View {
  _data;

  // Metodo que asigna a la variable privada el data y éste mismo llama las funciones que generan y renderean el HTML
  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render = true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render = false
   * @this {Object} View object
   * @author Pedro Duran
   * @todo Finish implementation
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0)) return this.renderError();
    this._data = data;
    const markup = this._generateMarkup();

    if (!render) {
      return markup;
    }
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderError(message = this._errorMessage) {
    const markup = `<div class="error">
                <div>
                  <svg>
                    <use href="src/img/${icons}#icon-alert-triangle"></use>
                  </svg>
                </div>
                <p>${message}</p>
              </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
  _clear() {
    // Borramos el placeholder text del container
    this._parentElement.innerHTML = '';
  }
  renderSpinner() {
    this._parentElement.innerHTML = '';
    const html = `
    <div class="spinner">
            <svg>
              <use href="${icons}#icon-loader"></use>
            </svg>
          </div>
          `;
    this._parentElement.insertAdjacentHTML('afterbegin', html);
  }

  update(data) {
    //if (!data || (Array.isArray(data) && data.length === 0)) return this.renderError();
    this._data = data;

    // Generamos un nuevo html markup para luego compararlo con el antiguo y actualizar solo los datos nuevos
    const newMarkup = this._generateMarkup();
    //Creamos un DOM con createRange y createContextualFragment usando el newMarkup
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    //Seleccionamos todos los elementos en el nodelist del nuevo DOM
    const newElements = newDOM.querySelectorAll('*');
    //Seleccionamos todos los elementos en el nodelist del ACTUAL DOM
    const curElements = this._parentElement.querySelectorAll('*');
    //Checamos cada elemento del nodelist del nuevo DOM para compararlo con el actual con isEqualNode
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      // Comparamos el texto
      if (!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue.trim() !== '') {
        curEl.textContent = newEl.textContent;
      }
      //Checamos y updateamos los attributes de los elementos (Crea un array de todos los attributes del nodo que sean diferentes entre el nuevo y actual DOM)
      // Esto funciona con los attributes de los buttons que cambia el dataset para cambiar los servings
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr => curEl.setAttribute(attr.name, attr.value));
      }
    });
  }
}
