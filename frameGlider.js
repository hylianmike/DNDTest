Array.prototype.matchArray = function (value){
    var i;
    for (i=0; i < this.length; i++) {
        var result = value.match( new RegExp(this[i], "g") )
        if (result) {
            return true;
        }
    }
    return false;
};

var FrameGlider = {

    mouseFollower: {element: null, x: 10, y: 10, delay: 200, delayComplete: false, delayTimer: null},
    draggableUnit: [],
    droppableUnit: [],
    pointOfInterestUnit: [],
    initialized: false,
    ignoreFrames: [],
    preventDefaultOnMouseDown: true,
    droppedOnNothing: null,
    topData: { disabled: true, currentlyOver: {}, dragStarted: false, lastMousePos: {x: 0, y: 0}},

    getDisabledStatus: function() {
        return top.FrameGlider.topData.disabled;
    },

    setDisabledStatus: function(status) {
        top.FrameGlider.topData.disabled = status;
    },

    // Phase II, part B
    changeTopCurrentlyOver: function(newCurrentlyOver) {
        if (window != top) {
            return;
        }

        if ( (FrameGlider.topData.currentlyOver.unit != newCurrentlyOver.unit) ||
                (FrameGlider.topData.currentlyOver.frame != newCurrentlyOver.frame) ||
                (FrameGlider.topData.currentlyOver.type != newCurrentlyOver.type) ) {
        	
            if (FrameGlider.topData.currentlyOver.unit &&
                FrameGlider.topData.currentlyOver.unit.mouseOutCallback) {
            
                    FrameGlider.topData.currentlyOver.unit.mouseOutCallback.call(FrameGlider.topData.currentlyOver.frame.FrameGlider, FrameGlider.topData.currentlyOver.unit);
            }

            if (newCurrentlyOver.unit && 
                newCurrentlyOver.unit.mouseOverCallback) {
                newCurrentlyOver.unit.mouseOverCallback.call(newCurrentlyOver.frame.FrameGlider, newCurrentlyOver.unit);

            }
            
        }

        FrameGlider.topData.currentlyOver = newCurrentlyOver;
        FrameGlider.topData.dragStarted = true;

    },

    addDraggableUnit: function(unit) {
        FrameGlider.draggableUnit[ FrameGlider.draggableUnit.length ] = unit;
        if (unit.element.addEventListener) {
            unit.element.addEventListener("mousedown", FrameGlider.handleMouseDown, false);
        } else {
            unit.element.attachEvent("onmousedown", FrameGlider.handleMouseDown);
        }

        unit.element.onselectstart = function() {return false;};

    },

    removeDraggableUnit: function(unit) {
        for (var i = 0; i < FrameGlider.draggableUnit.length; i++) {
            if (unit == FrameGlider.draggableUnit[i]) {
                FrameGlider.draggableUnit.splice(i, 1);
                break;
            }
        }

        if (unit.element.removeEventListener) {
            unit.element.removeEventListener("mousedown", FrameGlider.handleMouseDown, false);
        } else {
            unit.element.detachEvent("onmousedown", FrameGlider.handleMouseDown);
        }

        unit.element.onselectstart = null;
        
    },

    addDroppableUnit: function(unit) {
        FrameGlider.droppableUnit[ FrameGlider.droppableUnit.length ] = unit;
    },

    removeDroppableUnit: function(unit) {
        for (var i = 0; i < FrameGlider.droppableUnit.length; i++) {
            if (unit == FrameGlider.droppableUnit[i]) {
                FrameGlider.droppableUnit.splice(i, 1);
                break;
            }
        }
    },

    addPointOfInterestUnit: function(unit) {
        FrameGlider.pointOfInterestUnit[ FrameGlider.pointOfInterestUnit.length ] = unit;
    },

    removePointOfInterestUnit: function(unit) {
        for (var i = 0; i < FrameGlider.pointOfInterestUnit.length; i++) {
            if (unit == FrameGlider.pointOfInterestUnit[i]) {
                FrameGlider.pointOfInterestUnit.splice(i, 1);
                break;
            }
        }
    },

    handleMouseDown: function(e) {

        if (top.FrameGlider.topData.disabled) {
            return;
        }

        var clickType = e.which ? e.which : e.button;
        
        if (clickType != 1) {
        	return;
        }
        
        for (var i = 0; i < FrameGlider.draggableUnit.length; i++) {
            if (this == FrameGlider.draggableUnit[i].element) {
                if (FrameGlider.draggableUnit[i].mouseDownCallback) {
                    FrameGlider.draggableUnit[i].mouseDownCallback.call(this, FrameGlider.draggableUnit[i]);
                }
            }
        }

        var comm = new FG_Communicate();
        comm.message = null;
        comm.call = "FrameGlider.startTrackingMouse";
        comm.direction = "top";
        comm.propagate = false;
        comm.sendMessage();

        if (FrameGlider.preventDefaultOnMouseDown) {
            if (e.preventDefault)
                e.preventDefault();
            else
                e.returnValue= false;
            return false;
        }

    },

    handleMouseUp: function(e) {

        var comm = new FG_Communicate();
        comm.message = null;
        comm.call = "FrameGlider.stopTrackingMouse";
        comm.direction = "top";
        comm.propagate = false;
        comm.sendMessage();

    },

    startTrackingMouse: function() {

        if (document.addEventListener) {
            document.addEventListener("mousemove", FrameGlider.trackMouseMove, false);
            document.addEventListener("mouseup", FrameGlider.handleMouseUp, false);
        } else {
            document.attachEvent("onmousemove", FrameGlider.trackMouseMove);
            document.attachEvent("onmouseup", FrameGlider.handleMouseUp);
        }
        
        if (window == top) {
            var comm = new FG_Communicate();
            comm.message = null;
            comm.call = "FrameGlider.startTrackingMouse";
            comm.direction = "down";
            comm.propagate = true;
            comm.sendMessage();
        }

    },

    stopTrackingMouse: function() {

        if (document.removeEventListener) {
            document.removeEventListener("mousemove", FrameGlider.trackMouseMove, false);
            document.removeEventListener("mouseup", FrameGlider.handleMouseUp, false);
        } else {
            document.detachEvent("onmousemove", FrameGlider.trackMouseMove);
            document.detachEvent("onmouseup", FrameGlider.handleMouseUp);
        }

        if (window == top) {

            if (FrameGlider.mouseFollower.element) {
                FrameGlider.mouseFollower.element.style.display = "none";
                if (FrameGlider.mouseFollower.delayTimer) {
                	clearTimeout(FrameGlider.mouseFollower.delayTimer);
                	FrameGlider.mouseFollower.delayTimer = null;
                }
                //FrameGlider.mouseFollower.delayComplete = false;
            }

            var comm = new FG_Communicate();
            comm.message = null;
            comm.call = "FrameGlider.stopTrackingMouse";
            comm.direction = "down";
            comm.propagate = true;
            comm.sendMessage();

            if (FrameGlider.topData.currentlyOver.unit) {
                if (FrameGlider.topData.currentlyOver.unit.mouseOutCallback) {
                    FrameGlider.topData.currentlyOver.unit.mouseOutCallback.call(FrameGlider.topData.currentlyOver.frame.FrameGlider, FrameGlider.topData.currentlyOver.unit);
                }

                if ((FrameGlider.topData.currentlyOver.type == "droppable") && FrameGlider.topData.currentlyOver.unit.mouseUpCallback) {
                    FrameGlider.topData.currentlyOver.unit.mouseUpCallback.call(FrameGlider.topData.currentlyOver.frame.FrameGlider, FrameGlider.topData.currentlyOver.unit);
                }
            }

            if (FrameGlider.droppedOnNothing && FrameGlider.topData.dragStarted) {
                if (!FrameGlider.topData.currentlyOver.unit || FrameGlider.topData.currentlyOver.type != "droppable" ) {
                    FrameGlider.droppedOnNothing.call(this, FrameGlider.topData.lastMousePos);
                }
                FrameGlider.topData.dragStarted = false;
            }

            FrameGlider.topData.currentlyOver = {};

        }
    },

    trackMouseMove: function(e) {

        var mousePos = FrameGlider.mouseCoords(e);

        if ( isNaN(mousePos.x) || isNaN(mousePos.y) ) {
            return;
        }

        var comm = new FG_Communicate();
        comm.message = {mousePos: mousePos, windowName: window.name};
        comm.call = "FrameGlider.handleLowerFrameInfo";
        comm.direction = "up";
        comm.propagate = false;
        comm.sendMessage();

        if (window == top) {
            FrameGlider.handleUpperFrameInfo({mousePos: mousePos});
        }

    },

    // Phase I, part A
    handleLowerFrameInfo: function(input) {

        var iframes = document.getElementsByName(input.windowName);
        var mousePos = {};
        var iframePos = FrameGlider.elementCoords(iframes[0]);

        mousePos.x = input.mousePos.x + iframePos.x;
        mousePos.y = input.mousePos.y + iframePos.y;

        var comm = new FG_Communicate();
        comm.message = {mousePos: mousePos, windowName: window.name};
        comm.call = "FrameGlider.handleLowerFrameInfo";
        comm.direction = "up";
        comm.propagate = false;
        comm.sendMessage();

        if (window == top) {
            FrameGlider.handleUpperFrameInfo({mousePos: mousePos});
        }

    },

    // Phase I, part B
    handleUpperFrameInfo: function(input) {

        if (window == top) {
        	if (!FrameGlider.mouseFollower.delayTimer) {
        		FrameGlider.mouseFollower.delayTimer = setTimeout("FrameGlider.mouseFollower.delayComplete = true;", FrameGlider.mouseFollower.delay);
        		FrameGlider.mouseFollower.delayComplete = false;
        	}
            FrameGlider.moveMouseFollower(input.mousePos);
            FrameGlider.topData.lastMousePos = input.mousePos;
        }

        var frameName = FrameGlider.mouseOverWhichFrame(input.mousePos);
        var mousePos = {};

        if (!frameName) {  // somewhere in the body of this frame. check if it is over or out of a unit
            FrameGlider.handleMouseOverOutUnits(input.mousePos);
        } else {
            var iframes = document.getElementsByName(frameName);
            var iframePos = FrameGlider.elementCoords(iframes[0]);
            mousePos.x = input.mousePos.x - iframePos.x;
            mousePos.y = input.mousePos.y - iframePos.y;

            var comm = new FG_Communicate();
            comm.message = {mousePos: mousePos, windowName: window.name};
            comm.call = "FrameGlider.handleUpperFrameInfo";
            comm.direction = "child";
            comm.directionParameter = frameName;
            comm.propagate = false;
            comm.sendMessage();
        }

    },

    // Phase II, part A
    handleMouseOverOutUnits: function(mousePos) {

        var notOverAnything = true;
        var currentlyOver = {};

        for (var i = 0; i < FrameGlider.droppableUnit.length; i++) {
            if (FrameGlider.pointIsWithinElement(FrameGlider.droppableUnit[i].element, mousePos.x, mousePos.y)) {
                notOverAnything = false;
                currentlyOver.type = "droppable";
                currentlyOver.frame = window;
                currentlyOver.unit = FrameGlider.droppableUnit[i];
            }
        }

        if (notOverAnything) {
            for (var i = 0; i < FrameGlider.pointOfInterestUnit.length; i++) {
                if (FrameGlider.pointIsWithinElement(FrameGlider.pointOfInterestUnit[i].element, mousePos.x, mousePos.y)) {
                    notOverAnything = false;
                    currentlyOver.type = "pointOfInterestUnit";
                    currentlyOver.frame = window;
                    currentlyOver.unit = FrameGlider.pointOfInterestUnit[i];
                }
            }
        }

        if (notOverAnything) {
            for (var i = 0; i < FrameGlider.draggableUnit.length; i++) {
                if (FrameGlider.pointIsWithinElement(FrameGlider.draggableUnit[i].element, mousePos.x, mousePos.y)) {
                    notOverAnything = false;
                    currentlyOver.type = "draggable";
                    currentlyOver.frame = window;
                    currentlyOver.unit = FrameGlider.draggableUnit[i];
                }
            }
        }

        var comm = new FG_Communicate();
        comm.message = currentlyOver;
        comm.call = "FrameGlider.changeTopCurrentlyOver";
        comm.direction = "top";
        comm.propagate = false;
        comm.sendMessage();

    },

    moveMouseFollower: function(mousePos) {
        if (FrameGlider.mouseFollower.element) {
        	if (FrameGlider.mouseFollower.delayComplete) {
        		FrameGlider.mouseFollower.element.style.display = "block";
        	}
            FrameGlider.mouseFollower.element.style.left = mousePos.x + FrameGlider.mouseFollower.x + "px";
            FrameGlider.mouseFollower.element.style.top = mousePos.y + FrameGlider.mouseFollower.y + "px";
        }
    },

    pointIsWithinElement: function(element, x, y) {
        elementPos = FrameGlider.elementCoords(element)
        elementBottomRightPos = { x: elementPos.x + element.offsetWidth, y: elementPos.y + element.offsetHeight };
        if ( (x > elementPos.x) &&
             (y > elementPos.y) &&
             (x < elementBottomRightPos.x) &&
             (y < elementBottomRightPos.y)
           ) {
            return true;
        }

        return false;
    },

    elementCoords: function(element) {

        var x = 0;
        var y = 0;

        do {
            y += element.offsetTop  || 0;
            x += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);

        return {x: x, y: y};

    },

    mouseOverWhichFrame: function(mousePos) {

        var maxZIndex = -10000;
        var frame = null;
        var frameName = null;

        for (i = 0; i < window.frames.length; i++) {
            if (!FrameGlider.ignoreFrames.matchArray(window.frames[i].name)) {
                frame = document.getElementsByName(window.frames[i].name)[0];
                if ( FrameGlider.pointIsWithinElement(frame, mousePos.x, mousePos.y) &&
                     (frame.style.zIndex > maxZIndex) ) {
                    maxZIndex = frame.style.zIndex;
                    frameName = window.frames[i].name;
                }
            }
        }

        return frameName;

    },

    mouseCoords: function(e){
	if(e.pageX || e.pageY){
		return {x:e.pageX, y:e.pageY};
	}
	return {
		x:e.clientX + document.body.scrollLeft - document.body.clientLeft,
		y:e.clientY + document.body.scrollTop  - document.body.clientTop
	};
    }

}

function FG_Unit(element, options) {

    this.element = element;

    this.mouseUpCallback = options.mouseUpCallback ? options.mouseUpCallback : null;
    this.mouseDownCallback = options.mouseDownCallback ? options.mouseDownCallback : null;
    this.mouseOverCallback = options.mouseOverCallback ? options.mouseOverCallback : null;
    this.mouseOutCallback = options.mouseOutCallback ? options.mouseOutCallback : null;

}

FG_Unit.prototype.element;
FG_Unit.prototype.mouseUpCallback;
FG_Unit.prototype.mouseDownCallback;
FG_Unit.prototype.mouseOverCallback;
FG_Unit.prototype.mouseOutCallback;

function FG_Communicate() {

    this.message = null;
    this.call = null;
    this.propagate = false;
    this.direction = "up";
    this.directionParameter = "";

}

FG_Communicate.prototype.message;
FG_Communicate.prototype.call;
FG_Communicate.prototype.propagate;
FG_Communicate.prototype.direction;
FG_Communicate.prototype.directionParameter;

FG_Communicate.prototype.sendMessage = function() {

    if (top.FrameGlider.topData.disabled) {
        return false;
    }

    if (!this.call && !this.propagate) {
        return false;
    }

    switch(this.direction) {
        case 'top':
        	if (top.FG_receiveMessage) {
        		top.FG_receiveMessage(this);
        	}
            break;

        case 'up':
            if (window != top) {
            	if (parent.FG_receiveMessage) {
            		parent.FG_receiveMessage(this);
            	}
            }
            break;

        case 'down':
            for (i = 0; i < window.frames.length; i++) {
                if (!FrameGlider.ignoreFrames.matchArray(window.frames[i].name)) {
                	if (window.frames[i].FG_receiveMessage) {
                		window.frames[i].FG_receiveMessage(this);
                	}
                }
            }
            break;

        case 'child':
            var matchingFrames = document.getElementsByName(this.directionParameter)
            if (matchingFrames.length != 0) {
            	if (matchingFrames[0].contentWindow.FG_receiveMessage) {
            		matchingFrames[0].contentWindow.FG_receiveMessage(this);
            	}
            }
            break
    }

    return true;

}

FG_Communicate.prototype.processMessage = function() {

    if (this.call) {
        var callSplit = this.call.split(".");
        var functionToCall = window[ callSplit[0] ];

        for (i = 1; i < callSplit.length; i++) {
            functionToCall = functionToCall[ callSplit[1] ];
        }

        functionToCall.call(window[ callSplit[0] ], this.message)
    }

    if (this.propagate) {
        this.sendMessage();
    }

}

function FG_receiveMessage(communicateObj) {

    var newCommunicateObj = new FG_Communicate();
    newCommunicateObj.message = communicateObj.message;
    newCommunicateObj.call = communicateObj.call;
    newCommunicateObj.direction = communicateObj.direction;
    newCommunicateObj.propagate = communicateObj.propagate;
    newCommunicateObj.processMessage();

}

function FG_Init() {

    for (i = 0; i < window.frames.length; i++) {
        if (!FrameGlider.ignoreFrames.matchArray(window.frames[i].name)) {
            if (!window.frames[i].FrameGlider) {
                return;
            }
            if (!window.frames[i].FrameGlider.initialized) {
                return;
            }
        }
    }

    // executed only if window.frames.length is 0 or all child frames are initialized
    FrameGlider.initialized = true;
    if (window != top) {
        parent.FG_Init();
    } else {
        FrameGlider.topData.disabled = false;
    }

}

if (window.addEventListener) {
    window.addEventListener("load", FG_Init, false);
} else {
    window.attachEvent("onload", FG_Init);
}
