
/*
*************************************
CONSTANTS AND VARIABLES *************
*************************************
*/

const BASE_LENGTH = 10;
const VISIBLE_LENGTH = 4;
const MIN_VALUE = -100;
const MAX_VALUE = 100;
const pixelsPerItem = 50;

const baseList = [
    ...Array.from({ length: VISIBLE_LENGTH }, () => getRandomInt(1, 3)),
    ...Array(BASE_LENGTH - VISIBLE_LENGTH).fill(0)
];

const numListEl = document.getElementById('num-list');
const handle = document.getElementById('handle')
const randomizeBtn = document.getElementById('randomize-btn');

let currentLength = 4;                                          // initial list size
let isDragging = false;                                         // used when mouse is dragging
let startX = 0;
let holdIntervals = new Map();
let lastFocusedIndex = null;

/*
*************************************
UTILITY FUNCTIONS *******************
*************************************
*/

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function updateValue(index, delta = 0, newValue = null) {
    
    if (newValue !== null) {
        baseList[index] = clamp(newValue, MIN_VALUE, MAX_VALUE);
    } else {
        baseList[index] = clamp(baseList[index] + delta, MIN_VALUE, MAX_VALUE);
    }

}

function renderListAndSet () {
    renderList(currentLength);
    renderSetList(currentLength);
}

function randomizeBaseList() {
    
    for (let i = 0; i < currentLength; i++) {
        baseList[i] = getRandomInt(0, 5);
    }
    
    renderListAndSet();
}

function attachHoldHandler(button, index, direction) {
    let intervalId = null;

    const step = () => {
        const prev = baseList[index];
        updateValue(index, direction);
        const next = baseList[index];

        if (prev !== next) {
            // Only re-render if the value actually changed
            renderListAndSet();
        } else {
            stop(); // reached max/min
        }

    };

    const start = () => {
        step(); // First step immediately
        intervalId = setInterval(step, 150);
    };

    const stop = () => {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };

    button.addEventListener('mousedown', start);
    button.addEventListener('mouseup', stop);
    button.addEventListener('mouseleave', stop);
    document.addEventListener('mouseup', stop);
}


/*
*************************************
RENDERING ***************************
*************************************
*/

function renderList(length) {                                   // called everytime a portion of the list needs to be graphically rendered

    for (const interval of holdIntervals.values()) {
        clearInterval(interval);
    }

    holdIntervals.clear();
    
    numListEl.innerHTML = '';                                   // empties the displayed list
    const displayList = baseList.slice(0, length);              // displayLIst is a slice of baseList (complete list)

    displayList.forEach((value, index) => {                     // looping through each value and it's respective index
        // overall input wrapper
        const wrapper = document.createElement('div');          // creating a wrapper to include arrows on top and bottom of <input>
        wrapper.className = 'input-wrapper';
        
        // up arrow button
        const upArrow = document.createElement('div');          // creating a div for the up arrow
        upArrow.className = 'arrow up';
        upArrow.textContent = '▲';
        attachHoldHandler(upArrow, index, +1);

        // input field
        const input = document.createElement('input');          // creating a new input element
        input.type = 'number';                                  // setting the input type as number (includes a spinner)
        input.value = value;                                    // setting the value as the current value in the loop
        input.className = "list-input";                         // setting the className as 'list-input'
        input.dataset.index = index;                            // storing it's position in baseList
        input.id = `list-input-${index}`;

        // type editing
        input.addEventListener('input', (e) => {
            const i = parseInt(e.target.dataset.index);
            const raw = e.target.value;
            let val = parseInt(raw);

            if (!isNaN(val)) {
                updateValue(i, 0, val);
            }
    
        });

        input.addEventListener('blur', () => {
            const i = parseInt(input.dataset.index);
            let val = parseInt(input.value);

            if (isNaN(val)) {
                val = 0;
                input.value = val; // reflect correction in the UI
            }

            updateValue(i, 0, val);

            requestAnimationFrame(() => {
                const active = document.activeElement;

                if (!active || !active.classList.contains('list-input')) {
                    lastFocusedIndex = null;
                    renderListAndSet();
                }
                
            });

        });

        input.addEventListener('keydown', (e) => {
            const i = parseInt(e.target.dataset.index);

            // Handle Arrow Up/Down
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const delta = e.key === 'ArrowUp' ? +1 : -1;
                const prev = baseList[i];
                updateValue(i, delta);

                if (baseList[i] !== prev) renderListAndSet();

            }

            if (e.key === 'Enter' || e.key === 'Escape') {
                e.preventDefault();
                lastFocusedIndex = null;
                renderListAndSet();
            }

        });

            // scroll wheel editing
        input.addEventListener('wheel', (e) => {                // this event will edit the value in the <input> with the scroll wheel
            e.preventDefault();                                 // prevent the page from scrolling
            const i = parseInt(e.target.dataset.index);
            const delta = e.deltaY < 0 ? +1 : -1;
            const prev = baseList[i];
            updateValue(i, delta);

            if (baseList[i] !== prev) renderListAndSet();

        });

        input.addEventListener('focus', () => {
            lastFocusedIndex = index;
        });

        // down arrow button
        const downArrow = document.createElement('div');        // creating a div for the up arrow
        downArrow.className = 'arrow down';
        downArrow.textContent = '▼';
        attachHoldHandler(downArrow, index, -1);

        // assemble elements in wrapper
        wrapper.appendChild(upArrow);
        wrapper.appendChild(input);
        wrapper.appendChild(downArrow);
        numListEl.appendChild(wrapper);                         // inserts the new <input> into the document

        if (index < displayList.length - 1) {                   // add a comma between each <input> unless it's the last value, index iteration 
            const comma = document.createElement('span');       // create a <span> element
            comma.textContent = ' , ';                          // assign ' , ' to it's text
            numListEl.appendChild(comma);                       // insert the <span> with it's new content
        }
        
    });

    const currentlyFocused = document.activeElement;
    const expectedFocusedId = `list-input-${lastFocusedIndex}`;

    if (
        lastFocusedIndex !== null &&
        (!currentlyFocused || currentlyFocused.id !== expectedFocusedId)
    ) {
        const toFocus = document.getElementById(expectedFocusedId);

        if (toFocus) {

            setTimeout(() => {
                toFocus.focus();
                toFocus.select();
            }, 0);

        }

    }

}

function renderSetList(length) {
    const setListEl = document.getElementById('set-list');
    setListEl.innerHTML = '';
    const visibleList = baseList.slice(0, length);
    const uniqueValues = [... new Set(visibleList)];

    uniqueValues.forEach((value, index) => {
        const span = document.createElement('span');
        span.className = 'set-item';
        span.textContent = value;
        setListEl.appendChild(span);

        if (index < uniqueValues.length - 1) {
            const comma = document.createElement('span');
            comma.textContent = ' , ';
            setListEl.appendChild(comma);
        }
    })
}

/*
*************************************
INTERACTION EVENTS ******************
*************************************
*/

document.addEventListener("mousemove", (e) => {                 // adding the 'mousemove' event listener to the document
    
    if (!isDragging) return;

    const dx = e.clientX - startX;                              // dx difference between current x position (clientX) - initial x position (startXs)

    if (Math.abs(dx) >= pixelsPerItem) {                        // when dx reaches the threshold of pixelsPerItem
        const direction = Math.sign(dx);                        // direction of growth
        const newLength = currentLength + direction;            // setting newLenfth as the previous length + direction

        if (newLength >= 0 && newLength <= baseList.length) {   // validating the newLength stays within the baseList length
            currentLength = newLength;                          // updating the length of the current displayed list
            renderListAndSet();                                 // updating the numListEL <span>
            startX += direction * pixelsPerItem;                // update the starting position
        }
    }
});

document.addEventListener("mouseup", () => {                    // assigning the 'mouseup' event listener (releasing the click)
    isDragging = false;                                         // reseting the isDragging boolean and the cursor shape
    document.body.style.cursor = "default";
});

handle.addEventListener("mousedown", (e) => {                   // adding the 'mousedown' event listener to the handle
    isDragging = true;
    startX = e.clientX;                                         // assigning the x position when mouse was clicked to startX
    document.body.style.cursor = "ew-resize";                   // changing cursor shape
});

randomizeBtn.addEventListener('click', randomizeBaseList);

/*
*************************************
INITIAL RENDER **********************
*************************************
*/

renderListAndSet();
