
/*
*************************************
CONSTANTS AND VARIABLES *************
*************************************
*/

const MIN_VALUE = -100;
const MAX_VALUE = 100;
const INITIAL_LIST_LENGTH = 4;
const MIN_LIST_LENGTH = 0;
const MAX_LIST_LENGTH = 10;
const PIXELS_PER_ITEM = 70; // I still need to adjust this further.
const GENERIC_SCROLL_TICK = 5;
const PRECISE_SCROLL_TICK = 1;
const INITIAL_MIN_RANDOM = 1;
const INITIAL_MAX_RANDOM = 3;
const RANDOM_BTN_MAX = 5;
const RANDOM_BTN_MIN = 1;
const BASE_LIST = [
    ...Array.from({ length: INITIAL_LIST_LENGTH }, () => getRandomInt(INITIAL_MIN_RANDOM, INITIAL_MAX_RANDOM)),
    ...Array(MAX_LIST_LENGTH - INITIAL_LIST_LENGTH).fill(0)
];

const numberListElement = document.getElementById('num-list');
const resizeHandleElement = document.getElementById('resize-handle');
const randomButtonElement = document.getElementById('randomize-btn');
const numberSetElement = document.getElementById('num-set');

/*
*************************************
CLASSES *****************************
*************************************
*/

class NumberList {

    constructor(element, fullList, visibleListLength = fullList.length) {
        this.element = element;
        this.fullList = [...fullList];
        this.visibleListLength = visibleListLength;
        this.wrapperList = [];
        this._render();
    }

    setVisibleLength(newLength) {

        if(newLength !== this.visibleListLength) {
            this.visibleListLength = newLength;
            this._render();
            numberSet.update();
        }

    }

    _render() {
        this.element.innerHTML = '';
        this.wrapperList = [];

        for (let i = 0; i < this.visibleListLength; i++) {
            const wrapper = new InputWrapper(i, this.fullList[i], this._handleValueChange.bind(this));
            this.element.appendChild(wrapper.getElement());

            if (i < this.visibleListLength - 1) {
                this.element.appendChild(document.createTextNode(' , '));
            }

            this.wrapperList.push(wrapper);

        }

    }

    _handleValueChange(index, newValue) {
        this.fullList[index] = newValue;
        numberSet.update();
    }

}

class InputWrapper {

    constructor(index, value, onUpdateValue) {
        this.index = index;
        this.onUpdateValue = onUpdateValue;
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'input-wrapper';

        this.upArrow = new Arrow('up', () => this._arrowUpdate(+1));
        this.input = new NumberInput(value, (newValue) => this._wheelUpdate(newValue));
        this.downArrow = new Arrow('down', () => this._arrowUpdate(-1));

        this.wrapper.appendChild(this.upArrow.getElement());
        this.wrapper.appendChild(this.input.getElement());
        this.wrapper.appendChild(this.downArrow.getElement());
    }
    
    getElement() {
        return this.wrapper;
    }

    update(value) {
        this.input.setValue(value);
    }

    _arrowUpdate(delta) {
        let current = this.input.getValue();
        let updated = clamp(current + delta);
        this.input.setValue(updated);
        this.onUpdateValue(this.index, updated);
    }

    _wheelUpdate(newValue) {
        this.onUpdateValue(this.index, newValue);
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

    constructor(value, onScroll) {
        this.onScroll = onScroll;
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
            const step = e.ctrlKey ? PRECISE_SCROLL_TICK : GENERIC_SCROLL_TICK;
            const increment = delta * step;

            let current = this.getValue();
            let updated = clamp(current + increment);
            this.setValue(updated);
            this.onScroll(updated);

        });

    }

}

class ResizeHandle {

    constructor(element, numberList) {
        this.element = element;
        this.numberList = numberList;
        this._attachEvents();
    }

    _attachEvents() {
        let isDragging = false;
        let startX = 0;
        let visibleListLength = 0;

        this.element.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            visibleListLength = this.numberList.visibleListLength;
            document.body.style.cursor = 'ew-size';
        });

        window.addEventListener('mousemove', (e) => {
            
            if(!isDragging) return;

            const dx = e.clientX - startX;            
            const deltaItems = Math.floor(dx / PIXELS_PER_ITEM);
            let newLength = clamp(visibleListLength + deltaItems, MIN_LIST_LENGTH, MAX_LIST_LENGTH);
            this.numberList.setVisibleLength(newLength);
        });

        window.addEventListener('mouseup', () => {

            if(isDragging) {
                isDragging = false;
                document.body.style.cursor = 'default';
            }

        });

    }

}

class RandomButton {

    constructor(element, numberList) {
        this.element = element;
        this.numberList = numberList;
        this.element.addEventListener('mousedown', () => {

            for (let i = 0; i < numberList.visibleListLength; i++) {
                const newValue = getRandomInt(RANDOM_BTN_MIN, RANDOM_BTN_MAX);
                this.numberList.fullList[i] = newValue;   
                this.numberList.wrapperList[i].update(newValue);             
            }

            numberSet.update();

        });

    }

}

class NumberSet {

    constructor(element, numberList) {
        this.element = element;
        this.numberList = numberList;
        this._render();
    }

    _render() {
        this.element.innerHTML = '';
        this.visibleList = this.numberList.fullList.slice(0, this.numberList.visibleListLength);
        this.set = [...new Set(this.visibleList)];
       
        this.set.forEach((value, index) => {
            const span = document.createElement('span');
            span.className = 'set-item';
            span.textContent = value;
            this.element.appendChild(span);

            if (index < this.set.length - 1) {
                const comma = document.createElement('span');
                comma.textContent = ' , ';
                this.element.appendChild(comma);
            }

        });
            
    }

    update() {
        this._render();
    }

}

/*
*************************************
FUNCTIONS ***************************
*************************************
*/

function clamp(value, min_value = MIN_VALUE, max_value = MAX_VALUE) {
    return Math.max(min_value, Math.min(max_value, value));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;   
}

/*
*************************************
MAIN ********************************
*************************************
*/

const numberList = new NumberList(numberListElement, BASE_LIST, INITIAL_LIST_LENGTH);
const resizeHandle = new ResizeHandle(resizeHandleElement, numberList);
const randomBtn = new RandomButton(randomButtonElement, numberList);
const numberSet = new NumberSet(numberSetElement, numberList);
