const baseList = [1, 2, 3, 5, 10, 5, 9, 8, 4, 7];
const numListEl = document.getElementById('num-list');
const handle = document.getElementById('handle')

const pixelsPerItem = 50;                                       // mouse sensitivity when dragging, bigger is less sensitive
let currentLength = 7;                                          // initial list size
let isDragging = false;                                         // used when mouse is dragging
let startX = 0;

function renderList(length) {                                   // called everytime a portion of the list needs to be graphically rendered
    numListEl.innerHTML = '';                                   // empties the displayed list
    const displayList = baseList.slice(0, length);              // displayLIst is a slice of baseList (complete list)

    displayList.forEach((value, index) => {                     // looping through each value and it's respective index
        const input = document.createElement('input');          // creating a new input element
        input.type = 'number';                                  // setting the input type as number (includes a spinner)
        input.value = value;                                    // setting the value as the current value in the loop
        input.className = "list-input";                         // setting the className as 'list-input'
        input.dataset.index = index;                            // storing it's position in baseList

        input.addEventListener('input', (e) => {                // adding an event listener that updates the value in this input field
            const i = parseInt(e.target.dataset.index);         // getting the index of the value
            baseList[i] = parseInt(e.target.value);             // setting the value to the baseList corresponding index
        });

        numListEl.appendChild(input);                           // inserts the new <input> into the document

        if (index < displayList.length - 1) {                   // add a comma between each <input> unless it's the last value, index iteration 
            const comma = document.createElement('span');       // create a <span> element
            comma.textContent = ' , ';                          // assign ' , ' to it's text
            numListEl.appendChild(comma);                       // insert the <span> with it's new content
        }
    });

}

renderList(currentLength);

handle.addEventListener("mousedown", (e) => {                   // adding the 'mousedown' event listener to the handle
    isDragging = true;
    startX = e.clientX;                                         // assigning the x position when mouse was clicked to startX
    document.body.style.cursor = "ew-resize";                   // changing cursor shape
});

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