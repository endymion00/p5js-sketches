/**
 * Informational Beings.
 * Website => https://www.fal-works.com/
 * Including module: p5ex (Copyright 2018 FAL, licensed under MIT).
 * @copyright 2018 FAL
 * @author FAL <falworks.contact@gmail.com>
 * @version 0.1.0
 * @license CC-BY-SA-3.0
 */

(function () {
    'use strict';

    /**
     * Spatial region.
     */
    class Region {
    }
    /**
     * Rectangle-shaped spatial region.
     */
    class RectangleRegion extends Region {
        get width() { return this.rightPositionX - this.leftPositionX; }
        get height() { return this.bottomPositionY - this.topPositionY; }
        get area() { return this.width * this.height; }
        constructor(x1, y1, x2, y2, margin = 0) {
            super();
            this.leftPositionX = x1 - margin;
            this.topPositionY = y1 - margin;
            this.rightPositionX = x2 + margin;
            this.bottomPositionY = y2 + margin;
        }
        contains(position, margin = 0) {
            return (position.x >= this.leftPositionX - margin && position.x <= this.rightPositionX + margin &&
                position.y >= this.topPositionY - margin && position.y <= this.bottomPositionY + margin);
        }
        constrain(position, margin = 0) {
            if (position.x < this.leftPositionX - margin)
                position.x = this.leftPositionX - margin;
            else if (position.x > this.rightPositionX + margin)
                position.x = this.rightPositionX + margin;
            if (position.y < this.topPositionY - margin)
                position.y = this.topPositionY - margin;
            else if (position.y > this.bottomPositionY + margin)
                position.y = this.bottomPositionY + margin;
        }
    }
    // default region -> add

    /**
     * (To be filled)
     * @hideConstructor
     */
    class ScalableCanvas {
        constructor(p5Instance, parameter, node, rendererType) {
            this.p = p5Instance;
            this.canvasElement = p5Instance.createCanvas(parameter.scaledWidth, parameter.scaledHeight, rendererType);
            if (this.canvasElement && 'parent' in this.canvasElement) {
                this.canvasElement.parent(node);
            }
            this.region = new RectangleRegion(0, 0, 0, 0);
            this.nonScaledShortSideLength = parameter.nonScaledShortSideLength;
            this.updateSize();
        }

        /**
         * (To be filled)
         */
        get scaleFactor() {
            return this._scaleFactor;
        }
        /**
         * (To be filled)
         */
        get nonScaledWidth() {
            return this._nonScaledWidth;
        }
        /**
         * (To be filled)
         */
        get nonScaledHeight() {
            return this._nonScaledHeight;
        }
        /**
         * (To be filled)
         */
        get aspectRatio() {
            return this._aspectRatio;
        }
        /**
         * (To be filled)
         * @param parameter
         */
        resize(parameter) {
            this.p.resizeCanvas(parameter.scaledWidth, parameter.scaledHeight);
            this.nonScaledShortSideLength = parameter.nonScaledShortSideLength;
            this.updateSize();
        }
        /**
         * (To be filled)
         */
        updateSize() {
            const p = this.p;
            this._scaleFactor = Math.min(p.width, p.height) / this.nonScaledShortSideLength;
            this._inversedScaleFactor = 1 / this._scaleFactor;
            this._nonScaledWidth = p.width / this._scaleFactor;
            this._nonScaledHeight = p.height / this._scaleFactor;
            this._aspectRatio = p.width / p.height;
            this.region.rightPositionX = this._nonScaledWidth;
            this.region.bottomPositionY = this._nonScaledHeight;
        }
        /**
         * Runs scale() of the current p5 instance for fitting the sketch to the current canvas.
         * Should be called every frame before drawing objects on the canvas.
         */
        scale() {
            this.p.scale(this._scaleFactor);
        }
        /**
         * Runs scale() with the inversed scale factor.
         */
        cancelScale() {
            this.p.scale(this._inversedScaleFactor);
        }
        /**
         * Converts a length value on the scaled canvas to the non-scaled one.
         * Typically used for interpreting mouseX and mouseY.
         * @param {number} scaledLength - scaled length value
         */
        getNonScaledValueOf(scaledLength) {
            return scaledLength / this._scaleFactor;
        }
    }
    ScalableCanvas.DUMMY_PARAMETERS = {
        scaledWidth: 100,
        scaledHeight: 100,
        nonScaledShortSideLength: 100,
    };

    /**
     * (To be filled)
     * (This is not implemented as an enum because it is not supported by rollup)
     */
    const ScalableCanvasTypes = {
        SQUARE640x640: 'SQUARE640x640',
        RECT640x480: 'RECT640x480',
        FULL: 'FULL',
        CUSTOM: 'CUSTOM',
    };

    class NormalColorUnit {
        constructor(p, p5Color) {
            this.p = p;
            this.p5Color = p5Color;
        }
        stroke() {
            this.p.currentRenderer.stroke(this.p5Color);
        }
        fill() {
            this.p.currentRenderer.fill(this.p5Color);
        }
    }
    class NoColorUnit {
        constructor(p) {
            this.p = p;
        }
        stroke() {
            this.p.currentRenderer.noStroke();
        }
        fill() {
            this.p.currentRenderer.noFill();
        }
    }
    class UndefinedColorUnit {
        stroke() {
        }
        fill() {
        }
    }
    class AlphaColorUnit {
        constructor(p, c, alphaResolution = 256) {
            this.p = p;
            const array = [];
            for (let alphaFactor = 0; alphaFactor < alphaResolution; alphaFactor += 1) {
                array.push(p.color(p.red(c), p.green(c), p.blue(c), p.alpha(c) * alphaFactor / (alphaResolution - 1)));
            }
            this.colorArray = array;
            this.maxIndex = alphaResolution - 1;
        }
        stroke(alphaValue) {
            this.p.currentRenderer.stroke(this.getColor(alphaValue));
        }
        fill(alphaValue) {
            this.p.currentRenderer.fill(this.getColor(alphaValue));
        }
        getColor(alphaValue) {
            return this.colorArray[alphaValue ? Math.floor(this.p.map(alphaValue, 0, 255, 0, this.maxIndex)) : this.maxIndex];
        }
    }
    function colorUnit(p, p5Color, alphaEnabled, alphaResolution) {
        if (!p || p5Color === undefined)
            return new UndefinedColorUnit();
        if (p5Color === null)
            return new NoColorUnit(p);
        if (alphaEnabled)
            return new AlphaColorUnit(p, p5Color, alphaResolution);
        return new NormalColorUnit(p, p5Color);
    }
    /**
     * Composition of two p5.Color instances. One for stroke(), one for fill().
     */
    class ShapeColor {
        /**
         *
         * @param p - p5ex instance.
         * @param {p5.Color | null | undefined} strokeColor - Color for stroke(). Null means noStroke().
         * @param {p5.Color | null | undefined} fillColor - Color for fill(). Null means noFill().
         * @param {boolean} [alphaEnabled]
         * @param {number} [alphaResolution]
         */
        constructor(p, strokeColor, fillColor, alphaEnabled, alphaResolution) {
            this.strokeColor = colorUnit(p, strokeColor, alphaEnabled, alphaResolution);
            this.fillColor = colorUnit(p, fillColor, alphaEnabled, alphaResolution);
        }
        /**
         * Applies colors to the current p5 renderer.
         * @param {number} alphaValue - Alpha channel value (0 - 255)
         */
        applyColor(alphaValue) {
            this.strokeColor.stroke(alphaValue);
            this.fillColor.fill(alphaValue);
        }
    }
    /**
     * Undefined object of p5ex.ShapeColor.
     * @static
     */
    ShapeColor.UNDEFINED = new ShapeColor(undefined, undefined, undefined);

    /**
     * An empty function.
     */
    const EMPTY_FUNCTION = () => { };
    /**
     * 1.5 * PI
     */
    const ONE_AND_HALF_PI = 1.5 * Math.PI;

    const dummyP5 = new p5((p) => {
        p.setup = () => {
            p.noCanvas();
        };
    });
    const TWO_PI = 2 * Math.PI;
    // Temporal vectors for calculation use in getClosestPositionOnLineSegment()
    const tmpVectorAP = dummyP5.createVector();
    const tmpVectorAB = dummyP5.createVector();
    /**
     * Returns random integer from 0 up to (but not including) the max number.
     */
    function randomInt(maxInt) {
        return Math.floor(Math.random() * maxInt);
    }
    /**
     * Returns random integer from the min number up to (but not including) the max number.
     */
    function randomIntBetween(minInt, maxInt) {
        return minInt + randomInt(maxInt - minInt);
    }
    /**
     * Returns n or -n randomly. (n = provided number)
     * @param {number} n - any number
     */
    function randomSign(n) {
        if (Math.random() < 0.5)
            return n;
        return -n;
    }
    /**
     * easeOutQuad.
     * @param ratio
     */
    function easeOutQuad(ratio) {
        return -Math.pow(ratio - 1, 2) + 1;
    }
    /**
     * easeOutQuart.
     * @param ratio
     */
    function easeOutQuart(ratio) {
        return -Math.pow(ratio - 1, 4) + 1;
    }

    function loopArrayLimited(array, callback, arrayLength) {
        let i = 0;
        while (i < arrayLength) {
            callback(array[i], i, array);
            i += 1;
        }
    }
    function loopArrayBackwardsLimited(array, callback, arrayLength) {

        while (arrayLength--) {
            callback(array[arrayLength], arrayLength, array);
        }
    }
    /**
     * @callback loopArrayCallBack
     * @param {} currentValue
     * @param {number} [index]
     * @param {Array} [array]
     */

    function roundRobinLimited(array, callback, arrayLength) {
        for (let i = 0, len = arrayLength - 1; i < len; i += 1) {
            for (let k = i + 1; k < arrayLength; k += 1) {
                callback(array[i], array[k]);
            }
        }
    }
    /**
     * @callback roundRobinCallBack
     * @param {} element
     * @param {} otherElement
     */

    function nestedLoopJoinLimited(array, otherArray, callback, arrayLength, otherArrayLength) {
        for (let i = 0; i < arrayLength; i += 1) {
            for (let k = 0; k < otherArrayLength; k += 1) {
                callback(array[i], otherArray[k]);
            }
        }
    }
    /**
     * @callback nestedLoopJoinCallBack
     * @param {} element
     * @param {} otherElement
     */

    /**
     * A class containing an array and several loop methods.
     */
    class LoopableArray {
        /**
         * @param {number} initialCapacity
         */
        constructor(initialCapacity = 256) {

            this.array = new Array(initialCapacity);
            this.length = 0;
        }
        /**
         * Returns a specific element.
         * It is recommended to check that you are going to specify a valid index number
         * before calling this method.
         * @returns The specified element.
         */
        get(index) {
            return this.array[index];
        }
        /**
         * Returns the last element.
         * It is recommended to check that this array is not empty before calling this method.
         * @returns The last element.
         */
        getLast() {
            return this.array[this.length - 1];
        }
        /**
         * Adds one element to the end of the array and returns the new length of the array.
         * @param {} element - The element to add to the end of the array.
         */
        push(element) {
            this.array[this.length] = element;
            this.length += 1;
            return this.length;
        }
        /**
         * Adds elements to the end of the array and returns the new length of the array.
         * @param {Array} array - The elements to add to the end of the array.
         */
        pushRawArray(array, arrayLength = array.length) {
            for (let i = 0; i < arrayLength; i += 1) {
                this.array[this.length + i] = array[i];
            }
            this.length += arrayLength;
            return this.length;
        }
        /**
         * Adds all elements from another LoopableArray and returns the new length of the array.
         * @param {LoopableArray} otherLoopableArray
         */
        pushAll(otherLoopableArray) {
            return this.pushRawArray(otherLoopableArray.array, otherLoopableArray.length);
        }
        /**
         * Removes and returns the last element.
         * It is recommended to check that this array is not empty before calling this method.
         * @returns The last element.
         */
        pop() {
            this.length -= 1;
            return this.array[this.length];
        }
        /**
         * Clears the array.
         */
        clear() {
            this.length = 0;
        }
        /**
         * @callback loopArrayCallBack
         * @param {} currentValue
         * @param {number} [index]
         * @param {Array} [array]
         */
        /**
         * Executes a provided function once for each array element.
         * @param {loopArrayCallBack} callback
         */
        loop(callback) {
            loopArrayLimited(this.array, callback, this.length);
        }
        /**
         * Executes a provided function once for each array element in descending order.
         * @param {loopArrayCallBack} callback
         */
        loopBackwards(callback) {
            loopArrayBackwardsLimited(this.array, callback, this.length);
        }
        /**
         * @callback elementPairCallBack
         * @param {} element
         * @param {} otherElement
         */
        /**
         * Executes a provided function once for each pair within the array.
         * @param {elementPairCallback} callback
         */
        roundRobin(callback) {
            roundRobinLimited(this.array, callback, this.length);
        }
        /**
         * Joins two arrays and executes a provided function once for each joined pair.
         * @param {LoopableArray} otherArray
         * @param {elementPairCallback} callback
         */
        nestedLoopJoin(otherArray, callback) {
            nestedLoopJoinLimited(this.array, otherArray.array, callback, this.length, otherArray.length);
        }
    }

    /**
     * (To be filled)
     */
    class DrawableArray extends LoopableArray {
        static drawFunction(value) {
            value.draw();
        }
        /**
         * Draws all child elements.
         */
        draw() {
            this.loop(DrawableArray.drawFunction);
        }
    }

    /**
     * (To be filled)
     */
    class SteppableArray extends LoopableArray {
        static stepFunction(value) {
            value.step();
        }
        /**
         * Steps all child elements.
         */
        step() {
            this.loop(SteppableArray.stepFunction);
        }
    }

    /**
     * (To be filled)
     */
    class SpriteArray extends LoopableArray {
    }
    SpriteArray.prototype.step = SteppableArray.prototype.step;
    SpriteArray.prototype.draw = DrawableArray.prototype.draw;

    /**
     * (To be filled)
     */
    class CleanableArray extends LoopableArray {
        /**
         *
         * @param initialCapacity
         */
        constructor(initialCapacity) {
            super(initialCapacity);
            this.recentRemovedElements = new LoopableArray(initialCapacity);
        }
        /**
         * Updates the variable 'isToBeRemoved'.
         * If it has cleanable child elements, calls clean() recursively and
         * removes the child elements which are to be removed.
         */
        clean() {
            this.recentRemovedElements.clear();
            let validElementCount = 0;
            for (let i = 0; i < this.length; i += 1) {
                this.array[i].clean();
                if (this.array[i].isToBeRemoved) {
                    this.recentRemovedElements.push(this.array[i]);
                    continue;
                }
                this.array[validElementCount] = this.array[i];
                validElementCount += 1;
            }
            this.length = validElementCount;
        }
    }

    /**
     * (To be filled)
     */
    class CleanableSpriteArray extends CleanableArray {
    }
    CleanableSpriteArray.prototype.draw = SpriteArray.prototype.draw;
    CleanableSpriteArray.prototype.step = SpriteArray.prototype.step;

    // temporal vectors for use in QuadraticBezierCurve.
    const tmpMidPoint1 = dummyP5.createVector();
    const tmpMidPoint2 = dummyP5.createVector();

    const temporalVector = dummyP5.createVector();

    /**
     * (To be filled)
     */
    class FrameCounter {
        constructor() {
            this.count = 0;
        }
        /**
         * Resets the counter.
         * @param count
         */
        resetCount(count = 0) {
            this.count = count;
            return this;
        }
        /**
         * Increments the frame count.
         */
        step() {
            this.count += 1;
        }
        /**
         * Returns the mod.
         * @param divisor
         */
        mod(divisor) {
            return this.count % divisor;
        }
    }

    /**
     * (To be filled)
     */
    class TimedFrameCounter extends FrameCounter {
        /**
         * True if this counter is activated.
         */
        get isOn() { return this._isOn; }

        /**
         *
         * @param durationFrameCount
         * @param completeBehavior
         */
        constructor(durationFrameCount, completeBehavior = EMPTY_FUNCTION) {
            super();
            this._isOn = true;
            this.completeBehavior = completeBehavior;
            this.durationFrameCount = durationFrameCount;
        }
        /**
         * Activate this counter.
         * @param duration
         * @chainable
         */
        on(duration) {
            this._isOn = true;
            if (duration)
                this.durationFrameCount = duration;
            return this;
        }
        /**
         * Deactivate this counter.
         * @chainable
         */
        off() {
            this._isOn = false;
            return this;
        }
        /**
         * @override
         */
        step() {
            if (!this._isOn)
                return;
            this.count += 1;
            if (this.count > this.durationFrameCount) {
                this.completeCycle();
            }
        }
    }

    /**
     * (To be filled)
     */
    class NonLoopedFrameCounter extends TimedFrameCounter {
        /**
         * True if the given frame count duration has ellapsed already.
         */
        get isCompleted() { return this._isCompleted; }

        /**
         *
         * @param durationFrameCount
         * @param completeBehavior
         */
        constructor(durationFrameCount, completeBehavior) {
            super(durationFrameCount, completeBehavior);
            this._isCompleted = false;
        }
        /**
         * @override
         * @chainable
         */
        on(duration) {
            super.on(duration);
            return this;
        }
        /**
         * @override
         * @chainable
         */
        off() {
            super.off();
            return this;
        }
        /**
         * @override
         */
        resetCount() {
            super.resetCount();
            this._isCompleted = false;
            return this;
        }
        /**
         * @override
         */
        getProgressRatio() {
            return this._isCompleted ? 1 : this.count / this.durationFrameCount;
        }
        /**
         * @override
         */
        completeCycle() {
            this._isCompleted = true;
            this._isOn = false;
            this.completeBehavior();
        }
    }

    /**
     * Extension of p5 class.
     */

    class p5exClass extends p5 {
        /**
         * Sets the current renderer object.
         * @param renderer
         */
        setCurrentRenderer(renderer) {
            this.currentRenderer = renderer;
        }
        /**
          * The non-scaled width of the canvas.
          */
        get nonScaledWidth() {
            return this.scalableCanvas.nonScaledWidth;
        }
        /**
         * The non-scaled height of the canvas.
         */
        get nonScaledHeight() {
            return this.scalableCanvas.nonScaledHeight;
        }

        /**
         * The ideal frame rate which was set by setFrameRate().
         */
        get idealFrameRate() { return this._idealFrameRate; }
        /**
         * Anglular displacement in radians per frame which corresponds to 1 cycle per second.
         * Set by setFrameRate().
         */
        get unitAngleSpeed() { return this._unitAngleSpeed; }
        /**
         * Positional displacement per frame which corresponds to 1 unit length per second.
         * Set by setFrameRate().
         */
        get unitSpeed() { return this._unitSpeed; }
        /**
         * Change of speed per frame which corresponds to 1 unit speed per second.
         * Set by setFrameRate().
         */
        get unitAccelerationMagnitude() { return this._unitAccelerationMagnitude; }
        /**
         * Constructor of class p5ex.
         * @param sketch
         * @param node
         * @param sync
         */
        constructor(sketch, node, sync) {
            super(sketch, typeof node === 'string' ? document.getElementById(node) || undefined : node, sync);
            if (!node || typeof node === 'boolean') {
                this.node = document.body;
            }
            else {
                this.node = typeof node === 'string' ? document.getElementById(node) || document.body : node;
            }
            this.currentRenderer = this;
            this.maxCanvasRegion = {
                width: 0,
                height: 0,
                getShortSideLength() { return Math.min(this.width, this.height); },
            };
            this.updateMaxCanvasRegion();
            this.setFrameRate();
        }
        /**
         * Calls frameRate() and sets variables related to the frame rate.
         * @param {number} [fps=60] - The ideal frame rate per second.
         */
        setFrameRate(fps = 60) {
            this.frameRate(fps);
            if (fps) {
                this._idealFrameRate = fps;
                this._unitAngleSpeed = 2 * Math.PI / this._idealFrameRate;
                this._unitSpeed = 1 / this._idealFrameRate;
                this._unitAccelerationMagnitude = this._unitSpeed / this._idealFrameRate;
            }
            return this;
        }
        /**
         * Updates the value of the variable maxCanvasRegion.
         */
        updateMaxCanvasRegion() {
            this.maxCanvasRegion.width = this.windowWidth;
            this.maxCanvasRegion.height = this.windowHeight;
            if (this.node === document.body)
                return;
            const containerRect = this.node.getBoundingClientRect();
            this.maxCanvasRegion.width = containerRect.width;
            this.maxCanvasRegion.height = containerRect.height;
        }
        /**
         * Create an instance of ScalableCanvas. This includes calling of createCanvas().
         * @param {ScalableCanvasType} type - Type chosen from p5ex.ScalableCanvasTypes.
         * @param {ScalableCanvasParameters} [parameters] - Parameters for type CUSTOM.
         * @param {string} [rendererType] - Either P2D or WEBGL.
         */
        createScalableCanvas(type, parameters, rendererType) {
            this.scalableCanvasType = type;
            this.scalableCanvas = new ScalableCanvas(this, this.createScalableCanvasParameter(type, parameters), this.node, rendererType);
        }
        /**
         * Resizes the ScalableCanvas. Does not work on OpenProcessing.
         * @param {ScalableCanvasType} [type] - Type chosen from p5ex.ScalableCanvasTypes.
         *     If undefined, the last used type will be used again.
         * @param {ScalableCanvasParameters} [parameters] - Parameters for type CUSTOM.
         */
        resizeScalableCanvas(type, parameters) {
            this.scalableCanvas.resize(this.createScalableCanvasParameter(type || this.scalableCanvasType, parameters));
        }
        createScalableCanvasParameter(type, parameters) {
            this.updateMaxCanvasRegion();
            const maxShortSide = this.maxCanvasRegion.getShortSideLength();
            switch (type) {
                case ScalableCanvasTypes.SQUARE640x640:
                    return {
                        scaledWidth: maxShortSide,
                        scaledHeight: maxShortSide,
                        nonScaledShortSideLength: 640,
                    };
                case ScalableCanvasTypes.RECT640x480:
                    return {
                        scaledWidth: maxShortSide,
                        scaledHeight: 0.75 * maxShortSide,
                        nonScaledShortSideLength: 480,
                    };
                case ScalableCanvasTypes.FULL:
                    return {
                        scaledWidth: this.maxCanvasRegion.width,
                        scaledHeight: this.maxCanvasRegion.height,
                        nonScaledShortSideLength: 640,
                    };
                default:
                    return parameters || ScalableCanvas.DUMMY_PARAMETERS;
            }
        }
    }

    const SKETCH_NAME = 'InformationalBeings';
    var Phase;
    (function (Phase) {
        Phase[Phase["DELAY"] = 0] = "DELAY";
        Phase[Phase["BIRTH"] = 1] = "BIRTH";
        Phase[Phase["MOTION"] = 2] = "MOTION";
        Phase[Phase["STOP"] = 3] = "STOP";
        Phase[Phase["DEATH"] = 4] = "DEATH";
    })(Phase || (Phase = {}));
    class ShapeElement {
        constructor(p, position, delayFrameCount = 0, isGenerator = true) {
            this.p = p;
            this.position = position;
            this.delayFrameCount = delayFrameCount;
            this.isGenerator = isGenerator;
            this.isToBeRemoved = false;
            this.phase = Phase.DELAY;
            this.ratio = 0;
            this.timers = new SteppableArray();
            this.birthDelayTimer = new NonLoopedFrameCounter(delayFrameCount, () => { this.birthTimer.on(); this.phase = Phase.BIRTH; }).on();
            this.timers.push(this.birthDelayTimer);
            this.birthTimer = new NonLoopedFrameCounter(60, () => { this.motionTimer.on(); this.phase = Phase.MOTION; this.generateNext(); }).off();
            this.timers.push(this.birthTimer);
            this.motionTimer = new NonLoopedFrameCounter(30, () => { this.deathDelayTimer.on(); this.phase = Phase.STOP; }).off();
            this.timers.push(this.motionTimer);
            this.deathDelayTimer = new NonLoopedFrameCounter(60, () => { this.deathTimer.on(); this.phase = Phase.DEATH; }).off();
            this.timers.push(this.deathDelayTimer);
            this.deathTimer = new NonLoopedFrameCounter(90, () => { this.isToBeRemoved = true; }).off();
            this.timers.push(this.deathTimer);
        }
        step() {
            this.timers.step();
            switch (this.phase) {
                case Phase.DELAY:
                    break;
                case Phase.BIRTH:
                    this.ratio = this.birthTimer.getProgressRatio();
                    break;
                case Phase.MOTION:
                    this.ratio = this.motionTimer.getProgressRatio();
                    break;
                case Phase.STOP:
                    this.ratio = 1;
                    break;
                case Phase.DEATH:
                    this.ratio = this.deathTimer.getProgressRatio();
                    break;
            }
        }
        clean() {
        }
        draw() {
            if (this.birthDelayTimer.isOn)
                return;
            const p = this.p;
            p.translate(this.position.x, this.position.y);
            this.drawShape();
            p.translate(-this.position.x, -this.position.y);
        }
        drawShape() {
        }
        generateNext() {
            if (!this.isGenerator)
                return;
            let nextPosition;
            do {
                nextPosition = this.p.createVector(this.position.x + randomSign(this.p.random(50, 320)), this.position.y + randomSign(this.p.random(50, 320)));
            } while (!this.p.scalableCanvas.region.contains(nextPosition, -100));
            ShapeElement.addElement(this.position, nextPosition);
        }
    }
    class HiddenGeneratorElement extends ShapeElement {
        constructor(p, position, delayFrameCount = 0) {
            super(p, position, delayFrameCount, true);
        }
    }
    class CircleElement extends ShapeElement {
        constructor(p, position, delayFrameCount = 0, isGenerator, color, baseSize) {
            super(p, position, delayFrameCount, isGenerator);
            this.baseSize = baseSize;
            this.shapeColor = new ShapeColor(p, color, null, true);
        }
        drawShape() {
            let currentSize;
            let weight = 1;
            let alpha = 255;
            switch (this.phase) {
                case Phase.BIRTH:
                    currentSize = this.baseSize * easeOutQuart(this.ratio);
                    break;
                case Phase.MOTION:
                    currentSize = this.baseSize;
                    weight += 3 * (1 - easeOutQuad(this.ratio));
                    break;
                case Phase.STOP:
                    currentSize = this.baseSize;
                    break;
                case Phase.DEATH:
                    currentSize = this.baseSize + 20 * this.p.sq(this.ratio);
                    alpha = 255 * (1 - this.ratio);
                    weight = weight * (1 - this.ratio);
                    if (alpha < 1)
                        return;
                    break;
                default:
                    currentSize = 0;
            }
            this.shapeColor.applyColor(alpha);
            this.p.strokeWeight(weight);
            this.p.ellipse(0, 0, currentSize, currentSize);
        }
    }
    class RectangleElement extends ShapeElement {
        constructor(p, position, delayFrameCount = 0, isGenerator, color, baseWidth, baseHeight) {
            super(p, position, delayFrameCount, isGenerator);
            this.baseWidth = baseWidth;
            this.baseHeight = baseHeight;
            this.shapeColor = new ShapeColor(p, color, null, true);
        }
        drawShape() {
            let currentWidth;
            let currentHeight;
            let weight = 1;
            let alpha = 255;
            switch (this.phase) {
                case Phase.BIRTH:
                    currentWidth = this.baseWidth * this.p.sq(this.ratio);
                    currentHeight = this.baseHeight * easeOutQuart(this.ratio);
                    break;
                case Phase.MOTION:
                    currentWidth = this.baseWidth;
                    currentHeight = this.baseHeight;
                    weight += 3 * (1 - easeOutQuad(this.ratio));
                    break;
                case Phase.STOP:
                    currentWidth = this.baseWidth;
                    currentHeight = this.baseHeight;
                    break;
                case Phase.DEATH:
                    currentWidth = this.baseWidth + 20 * this.p.sq(this.ratio);
                    currentHeight = this.baseHeight * (1 - this.p.sq(this.ratio));
                    alpha = 255 * (1 - this.ratio);
                    weight = weight * (1 - this.ratio);
                    if (alpha < 1)
                        return;
                    break;
                default:
                    currentWidth = 0;
                    currentHeight = 0;
            }
            this.shapeColor.applyColor(alpha);
            this.p.strokeWeight(weight);
            this.p.rect(0, 0, currentWidth, currentHeight);
        }
    }
    class CellElement extends ShapeElement {
        constructor(p, position, delayFrameCount = 0, color, offsetPosition) {
            super(p, position, delayFrameCount, false);
            this.offsetPosition = offsetPosition;
            this.shapeColor = new ShapeColor(p, null, color, true);
        }
        drawShape() {
            if (Math.random() < 0.01)
                return;
            let sizeRatio;
            let alpha = 255;
            switch (this.phase) {
                case Phase.BIRTH:
                    sizeRatio = easeOutQuart(this.ratio);
                    break;
                case Phase.MOTION:
                    sizeRatio = 1 + 0.25 * (1 - easeOutQuart(this.ratio));
                    break;
                case Phase.STOP:
                    sizeRatio = 1;
                    break;
                case Phase.DEATH:
                    sizeRatio = 1 - this.ratio;
                    alpha = 255 * (1 - this.ratio);
                    if (alpha < 1)
                        return;
                    break;
                default:
                    sizeRatio = 0;
            }
            this.shapeColor.applyColor(alpha);
            this.p.rect(this.offsetPosition.x, this.offsetPosition.y, 10 * sizeRatio, 14 * sizeRatio, 2);
        }
    }
    class LineElement extends ShapeElement {
        constructor(p, position, delayFrameCount = 0, isGenerator, color, startPosition, endPosition) {
            super(p, position, delayFrameCount, isGenerator);
            this.color = color;
            this.startPosition = startPosition;
            this.endPosition = endPosition;
            this.shapeColor = new ShapeColor(p, color, null, true);
        }
        lerpPosition(start, end, ratio) {
            return this.p.createVector(start.x + (end.x - start.x) * ratio, start.y + (end.y - start.y) * ratio);
        }
        drawShape() {
            let currentStartPosition = this.startPosition;
            let currentEndPosition = this.endPosition;
            let weight = 1;
            let alpha = 255;
            switch (this.phase) {
                case Phase.BIRTH:
                    currentEndPosition = this.lerpPosition(this.startPosition, this.endPosition, easeOutQuart(this.ratio));
                    break;
                case Phase.MOTION:
                    weight += 3 * (1 - easeOutQuad(this.ratio));
                    break;
                case Phase.STOP:
                    break;
                case Phase.DEATH:
                    currentStartPosition = this.lerpPosition(this.startPosition, this.endPosition, easeOutQuart(this.ratio));
                    currentEndPosition = this.lerpPosition(this.startPosition, this.endPosition, 1 + 0.2 * easeOutQuad(this.ratio));
                    alpha = 255 * (1 - this.ratio);
                    weight = weight * (1 - this.ratio);
                    if (alpha < 1)
                        return;
                    break;
                default:
            }
            this.shapeColor.applyColor(alpha);
            this.p.strokeWeight(weight);
            this.p.line(currentStartPosition.x, currentStartPosition.y, currentEndPosition.x, currentEndPosition.y);
        }
    }
    const sketch = (p) => {
        // ---- variables
        let backgroundColor;
        let shapeElements;
        let colorList;
        let defaultColor;
        // ---- functions
        // ---- Setup & Draw etc.
        p.preload = () => {
        };
        p.setup = () => {
            p.createScalableCanvas(ScalableCanvasTypes.SQUARE640x640);
            p.rectMode(p.CENTER);
            shapeElements = new CleanableSpriteArray();
            backgroundColor = p.color(248, 248, 248);
            defaultColor = p.color(64);
            colorList = [
                defaultColor,
                defaultColor,
                defaultColor,
                p.color(48, 48, 96),
            ];
            ShapeElement.addElement = (previousPosition, nextPosition) => {
                const color = p.random(colorList);
                const rayLine = new LineElement(p, nextPosition, 0, false, defaultColor, p5.Vector.sub(previousPosition, nextPosition), p.createVector(0, 0));
                switch (randomInt(4)) {
                    case 0:
                        shapeElements.push(rayLine);
                        shapeElements.push(new CircleElement(p, nextPosition, 6, true, color, p.random(80, 120)));
                        break;
                    case 1:
                        const circleSize = p.random(80, 120);
                        shapeElements.push(rayLine);
                        shapeElements.push(new CircleElement(p, nextPosition, 6, true, color, circleSize));
                        const angle1 = p.random(p.TWO_PI);
                        const angle2 = angle1 + p.radians(p.random(90, 150));
                        const angle3 = angle1 - p.radians(p.random(90, 150));
                        const position1 = p5.Vector.fromAngle(angle1).mult(circleSize / 2);
                        const position2 = p5.Vector.fromAngle(angle2).mult(circleSize / 2);
                        const position3 = p5.Vector.fromAngle(angle3).mult(circleSize / 2);
                        shapeElements.push(new LineElement(p, nextPosition, 12, false, color, position1, position2));
                        shapeElements.push(new LineElement(p, nextPosition, 18, false, color, position2, position3));
                        shapeElements.push(new LineElement(p, nextPosition, 24, false, color, position3, position1));
                        break;
                    case 2:
                        shapeElements.push(rayLine);
                        shapeElements.push(new RectangleElement(p, nextPosition, 6, true, color, p.random(30, 120), p.random(30, 120)));
                        break;
                    case 3:
                        shapeElements.push(new HiddenGeneratorElement(p, nextPosition, 0));
                        const rows = randomIntBetween(4, 10);
                        const columns = randomIntBetween(4, 10);
                        for (let x = 0; x < columns; x += 1) {
                            for (let y = 0; y < rows; y += 1) {
                                shapeElements.push(new CellElement(p, nextPosition, 1 * (y * columns + x), color, p.createVector((-columns / 2 + x) * 14, (-rows / 2 + y) * 18)));
                            }
                        }
                        break;
                }
            };
            shapeElements.push(new CircleElement(p, p.createVector(p.nonScaledWidth / 2, p.nonScaledHeight / 2), 0, true, p.random(colorList), 100));
        };
        p.draw = () => {
            p.background(backgroundColor);
            p.scalableCanvas.scale();
            shapeElements.step();
            shapeElements.clean();
            shapeElements.draw();
            p.scalableCanvas.cancelScale();
        };
        p.windowResized = () => {
        };
        p.mousePressed = () => {
            // if (!p5ex.mouseIsInCanvas(p)) return;
            // p.noLoop();
        };
        p.keyTyped = () => {
            if (p.keyCode === p.ENTER)
                p.noLoop();
        };
    };
    new p5exClass(sketch, SKETCH_NAME);

}());
//# sourceMappingURL=sketch.js.map
