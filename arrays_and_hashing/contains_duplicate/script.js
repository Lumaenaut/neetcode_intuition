
/*
*************************************
CONSTANTS AND VARIABLES *************
*************************************
*/

const MIN_VALUE = -100;
const MAX_VALUE = 100;
const INITIAL_LIST = [1, 2, 3];
const INITIAL_LIST_LENGTH = 4;
const MAX_LIST_LENGTH = 10;
const numListElement = document.getElementById('num-list');
const BASE_LIST = [
    ...Array.from({ length: INITIAL_LIST_LENGTH }, () => getRandomInt(1, 3)),    // creating a list with 2 parts, one with random numbers between 1 and 3
    ...Array(MAX_LIST_LENGTH - INITIAL_LIST_LENGTH).fill(0)                      // the other part filled with zeros
];

/*
*************************************
CLASSES *****************************
*************************************
*/

class NumberList {

    constructor(container, initialValues) {
        this.container = container;
        this.values = [...initialValues];
        this.wrappers = [];

        this._render();
    }

    _render() {
        this.container.innerHTML = '';
        this.wrappers = this.values.map((value, index) => {
            const wrapper = new InputWrapper(index, value, this._handleValueChange.bind(this));
            this.container.appendChild(wrapper.getElement());

            if(index < this.values.length - 1) {
                this.container.appendChild(document.createTextNode(' , '));
            }

            return wrapper;

        });

    }

    _handleValueChange(index, newValue) {
        this.values[index] = newValue;
    }

}

class InputWrapper {

    constructor(index, value, onUpdateValue) {
        this.index = index;
        this.onUpdateValue = onUpdateValue;
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'input-wrapper';

        this.upArrow = new Arrow('up', () => this._updatevalue(+1));
        this.input = new NumberInput(value);
        this.downArrow = new Arrow('down', () => this._updatevalue(-1));

        this.wrapper.appendChild(this.upArrow.getElement());
        this.wrapper.appendChild(this.input.getElement());
        this.wrapper.appendChild(this.downArrow.getElement());
    }
    
    _updatevalue(delta) {
        let current = this.input.getValue();
        let updated = clamp(current + delta);
        this.input.setValue(updated);
        this.onUpdateValue(this.index, updated);
    }
    
    getElement() {
        return this.wrapper;
    }

    update(value) {
        this.input.setValue(value);
    }

}

class Arrow {

    constructor(direction, onClick) {
        this.element = document.createElement('div');
        this.element.className = `arrow ${direction}`;
        this.element.textContent = direction === 'up' ? '▲' : '▼';
        this.element.addEventListener('mousedown', onClick);
    }

    getElement() {
        return this.element;
    }

}

class NumberInput {

    constructor(value) {
        this.element = document.createElement('input');
        this.element.type = 'number';
        this.element.className = 'list-input';
        this.element.value = value;
        this.element.disabled = true;
        this._attachWheelListener();
    }

    getElement() {
        return this.element;
    }

    setValue(value) {
        this.element.value = value;
    }

    getValue() {
        return parseInt(this.element.value);
    }

    _attachWheelListener() {

        this.element.addEventListener('wheel', (e) => {
            e.preventDefault();

            const delta = e.deltaY < 0 ? 1 :-1;
            const step = e.ctrlKey ? 1 : 5;
            const addedNum = delta * step;

            let current = this.getValue();
            let updated = clamp(current + addedNum);
            this.setValue(updated);
        });

    }

}

/*
*************************************
FUNCTIONS ***************************
*************************************
*/

function clamp(value) {
    return Math.max(MIN_VALUE, Math.min(MAX_VALUE, value));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;   
}

/*
*************************************
MAIN ********************************
*************************************
*/

new NumberList(numListElement, INITIAL_LIST);
