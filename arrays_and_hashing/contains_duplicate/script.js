const baseList = [1, 2, 3, 5, 10, 5, 9, 8, 4, 7];
const numListEl = document.getElementById('num-list');
const handle = document.getElementById('handle')

const pixelsPerItem = 50; // mouse sensitivity when dragging, bigger is less sensitive
let currentLength = 7; // initial list size
let isDragging = false;
let startX = 0;

function renderList(length) {
    numListEl.innerHTML = '';
    const displayList = baseList.slice(0, length);

    displayList.forEach((value, index) => {
        const input = document.createElement('input');
        input.type = 'number';
        input.value = value;
        input.className = "list-input";
        input.dataset.index = index;

        input.addEventListener('input', (e) => {
            const i = parseInt(e.target.dataset.index);
            baseList[i] = parseInt(e.target.value);
        });

        numListEl.appendChild(input);

        if (index <= displayList.length - 1) {
            const comma = document.createElement('span');
            comma.textContent = ' , ';
            numListEl.appendChild(comma);
        }
    });

}

renderList(currentLength);

handle.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    document.body.style.cursor = "ew-resize"; // changing cursor shape
});

document.addEventListener("mousemove", (e) => {
    
    if (!isDragging) return;

    const dx = e.clientX - startX; 

    if (Math.abs(dx) >= pixelsPerItem) {
        const direction = Math.sign(dx);
        const newLength = currentLength + direction

        if (newLength >= 0 && newLength <= baseList.length) {
            currentLength = newLength;
            renderList(currentLength);
            startX += direction * pixelsPerItem;
        }
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.cursor = "default";
});