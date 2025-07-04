const baseList = [1, 2, 3, 5, 10, 5, 9, 8, 4, 7];
const numListEl = document.getElementById('num-list');
const sliderEl = document.getElementById('list-slider');

let currentLength = 7; // initial list size
let isDragging = false;
let startX = 0;

function renderList(length) {
    const displayList = baseList.slice(0, length);
    numListEl.textContent = displayList.join(" , ");
}

renderList(currentLength);

// DRAG LOGIC
handle.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    document.body.style.cursor = "ew-resize";
});

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const pixelsPerItem = 30; // adjust sensitivity
    const deltaItems = Math.round(dx / pixelsPerItem);
    let newLength = currentLength + deltaItems;
    newLength = Math.max(0, Math.min(baseList.length, currentLength + deltaItems));

    if (newLength !== currentLength) {
        currentLength = newLength;
        renderList(currentLength);
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.cursor = "default";
});