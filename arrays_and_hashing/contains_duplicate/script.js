
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
    renderList(currentLength);
}

function randomizeBaseList() {
    
    for (let i = 0; i < currentLength; i++) {
        baseList[i] = getRandomInt(0, 5);
    }
    
    renderList(currentLength);
}

/*
*************************************
RENDERING ***************************
*************************************
*/

function renderList(length) {                                   // called everytime a portion of the list needs to be graphically rendered
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
        upArrow.addEventListener('click', () => updateValue(index, +1));

        // input field
        const input = document.createElement('input');          // creating a new input element
        input.type = 'number';                                  // setting the input type as number (includes a spinner)
        input.value = value;                                    // setting the value as the current value in the loop
        input.className = "list-input";                         // setting the className as 'list-input'
        input.dataset.index = index;                            // storing it's position in baseList

            // type editing
        input.addEventListener('input', (e) => {                // adding an event listener that updates the value in this input field
            const i = parseInt(e.target.dataset.index);         // getting the index of the value
            let val = e.target.value === '' ? 0 : parseInt(e.target.value);
            updateValue(i, 0, val);
        });

            // scroll wheel editing
        input.addEventListener('wheel', (e) => {                // this event will edit the value in the <input> with the scroll wheel
            e.preventDefault();                                 // prevent the page from scrolling
            const i = parseInt(e.target.dataset.index);
            const delta = e.deltaY < 0 ? +1 : -1;
            updateValue(i, delta);
        })

            // arrow key editing
        input.addEventListener('keydown', (e) => {              // this event will edit the value in the <input> with the up and down keys
            const i = parseInt(e.target.dataset.index);

            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const delta = e.key === 'ArrowUp' ? +1 : -1;                
                updateValue(i, delta);
                const newInput = document.querySelector(`input[data-index='${i}']`);
            
                if (newInput) newInput.focus();
            
            }

        })

        // down arrow button
        const downArrow = document.createElement('div');        // creating a div for the up arrow
        downArrow.className = 'arrow down';
        downArrow.textContent = '▼';
        downArrow.addEventListener('click', () => updateValue(index, -1));

        // assemble previous elements
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
        const newLength = currentLength + direction             // setting newLenfth as the previous length + direction

        if (newLength >= 0 && newLength <= baseList.length) {   // validating the newLength stays within the baseList length
            currentLength = newLength;                          // updating the length of the current displayed list
            renderList(currentLength);                          // updating the numListEL <span>
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

renderList(currentLength);
