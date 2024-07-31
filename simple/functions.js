function mouseDownDraggable(unit) {
    top.document.getElementById("messages").innerHTML = "Mouse down on <b>" + unit.element.innerHTML + "</b>";
    top.dragging = unit.element.innerHTML;
}

function mouseUpDroppable(unit) {
    top.document.getElementById("messages").innerHTML = "Mouse up on <b>" + unit.element.innerHTML + "</b>. Dropped <b>" + top.dragging + "</b> on it";
    top.dragging = "";
}

function mouseOverDraggable(unit) {
    unit.element.style.backgroundColor = "#FF9999";
}

function mouseOutDraggable(unit) {
    unit.element.style.backgroundColor = "#FFFFFF";
}

function mouseOverDroppable(unit) {
    unit.element.style.backgroundColor = "#99FF99";
}

function mouseOutDroppable(unit) {
    unit.element.style.backgroundColor = "#FFFFFF";
}

function mouseOverPointOfInterest(unit) {
    unit.element.style.backgroundColor = "#9999FF";
}

function mouseOutPointOfInterest(unit) {
    unit.element.style.backgroundColor = "#FFFFFF";

}