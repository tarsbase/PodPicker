/*!
 * Pod Picker - A Podcast Timeline Generator
 * https://github.com/RoberMac/PodPicker
 *
 * Copyright (c) 2015 RoberTu <robertu0717@gmail.com>
 * @license MIT
 * @version v0.2.2
 */

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

;(function (window, document) {

    'use strict';

    var PodPicker = (function () {
        /**
         *
         * @constructor
         * @this  {PodPicker}
         * @param {String}    container  Wrapper element's id
         * @param {Array}     items      Data items
         * @param {Object}    options    Options
         *
         */

        function PodPicker(container, items, options) {
            _classCallCheck(this, PodPicker);

            // init
            this.preTime = 0;
            this.itemsIndex = 0;
            this.seekingIndex = 0;
            this.startTimeSet = [];

            /**
              * Basic Check
              * throw an error if the parameters is invalid
              *
              */
            // Check `container` parameter
            PodPicker.isUndefined(container) ? PodPicker.throwError(PodPicker.ERROR_MSG.param_container) : PodPicker.isString(container) ? this.container = document.getElementById(container) : PodPicker.throwError(PodPicker.ERROR_MSG.type_container);

            !this.container ? PodPicker.throwError(PodPicker.ERROR_MSG.elem_container) : null;

            // Check `items` parameter
            PodPicker.isUndefined(items) ? PodPicker.throwError(PodPicker.ERROR_MSG.param_items) : PodPicker.isArray(items) ? items.length <= 0 ? PodPicker.throwError(PodPicker.ERROR_MSG.empty_items) : null : PodPicker.throwError(PodPicker.ERROR_MSG.type_items);

            // Check `options` parameter
            !PodPicker.isUndefined(options) && !PodPicker.isObject(options) ? PodPicker.throwError(PodPicker.ERROR_MSG.type_options) : this.options = options || {};

            // Sort items array by item object
            var that = this;
            this.items = items.sort(function (pre, next) {

                var pre = that.convertTime(pre.start),
                    next = that.convertTime(next.start);

                if (pre > next) {
                    return 1;
                } else if (pre < next) {
                    return -1;
                } else {
                    return 0;
                }
            });
            this.setup();
        }

        /**
         * Setup
         */

        _createClass(PodPicker, [{
            key: 'setup',
            value: function setup() {
                var that = this;

                this.setOptions();

                /**
                 * Check `audioElem` source file, throw error if audio file is MP3 file format
                 *
                 * For more details, see: 
                 *   http://forums.codescript.in/javascript/html5-audio-currenttime-attribute-inaccurate-27606.html
                 *   https://jsfiddle.net/yp3o8cyw/2/
                 *
                 */
                var currentSrcInterval = setInterval(function () {
                    var currentSrc = that.audioElem.currentSrc;
                    if (currentSrc) {
                        clearInterval(currentSrcInterval);
                        currentSrc.match(/\.mp3/i) ? that.throwError(PodPicker.ERROR_MSG.format_audioFile) : that.createTimeline();
                    }
                }, 10);
            }

            /**
             * Set Options
             *
             */
        }, {
            key: 'setOptions',
            value: function setOptions() {
                var options = this.options;

                // Allow options: 'audioElem', 'timelineColor', 'isShowStartTime'
                // Check option: 'audioElem'
                !PodPicker.isUndefined(options.audioElem) && !PodPicker.isString(options.audioElem) ? PodPicker.throwError(PodPicker.ERROR_MSG.type_options_audioElem) : null;

                // Check option: 'timelineColor'
                !PodPicker.isUndefined(options.timelineColor) ? !PodPicker.isString(options.timelineColor) ? PodPicker.throwError(PodPicker.ERROR_MSG.type_options_timelineColor) : PodPicker.isHexColor(options.timelineColor) ? null : PodPicker.throwError(PodPicker.ERROR_MSG.type_value_options_timelineColor) : null;

                // Check option: 'isShowStartTime'
                !PodPicker.isUndefined(options.isShowStartTime) && !PodPicker.isBoolean(options.isShowStartTime) ? PodPicker.throwError(PodPicker.ERROR_MSG.type_options_isShowStartTime) : null;

                // Set options
                this.audioElem = options.audioElem ? document.getElementById(options.audioElem) : document.getElementsByTagName('audio')[0];
                this.timelineColor = options.timelineColor || '#CECECF';
                this.isShowStartTime = options.isShowStartTime;
            }

            /**
             * Create the timeline element and then append it to `container` element
             *
             */
        }, {
            key: 'createTimeline',
            value: function createTimeline() {
                var that = this,
                    items = this.items,
                    audioElem = this.audioElem,
                    timelineColor = this.timelineColor,
                    isShowStartTime = this.isShowStartTime;

                var fragment = document.createDocumentFragment(''),
                    timeline = document.createElement('div'),
                    pointer = document.createElement('span'),
                    ul = document.createElement('ul');

                for (var i = 0, len = items.length; i < len; i++) {

                    var item = document.createElement('li'),
                        span = document.createElement('span'),
                        start = this.convertTime(items[i].start),
                        title = isShowStartTime ? items[i].start + ' - ' + items[i].title : items[i].title;

                    // Extract all `item` start time and then push it to `this.startTimeSet`
                    this.startTimeSet.push(start);(function (_item, start) {
                        // Jump to certain time offsets in `audioElem`
                        // when user click the item > span element
                        _item.addEventListener('click', function () {
                            audioElem.play();
                            audioElem.currentTime = start;
                            that.seekingIndex = window.setTimeout(function () {
                                document.getElementById('pp-pointer').className = 'seeking';
                            }, 500);
                        });
                    })(span, start);

                    item.className = 'pp-item';
                    span.appendChild(document.createTextNode(title));
                    item.appendChild(span);
                    ul.appendChild(item);
                }

                ul.style.color = timelineColor;
                pointer.id = 'pp-pointer';
                timeline.id = 'pp-timeline';
                timeline.appendChild(ul);
                timeline.appendChild(pointer);
                fragment.appendChild(timeline);
                this.container.appendChild(fragment);

                // Register event handlers to `audioElem` element
                audioElem.addEventListener('timeupdate', function () {
                    // init
                    var currentTime = audioElem.currentTime,
                        startTimeSet = that.startTimeSet,
                        len = startTimeSet.length;

                    if (Math.abs(that.preTime - currentTime) > 1) {
                        // user-triggered
                        for (var i = 0; i < len; i++) {
                            startTimeSet[i + 1] // the last one
                            ? currentTime >= startTimeSet[i] && currentTime <= startTimeSet[i + 1] ? that.setPointerPosition(i + 1) : null : currentTime >= startTimeSet[i] ? that.setPointerPosition(i + 1) : null;
                        }
                    } else {
                        // auto-triggered
                        for (var i = 0; i < len; i++) {
                            currentTime > startTimeSet[i] - 1 && currentTime <= startTimeSet[i] + 1 && that.itemsIndex !== i + 1 ? that.setPointerPosition(i + 1) : null;
                        }
                    }

                    that.preTime = currentTime;
                });
                // Seeking
                audioElem.addEventListener('seeking', function () {
                    audioElem.pause();
                });
                // Seeked
                audioElem.addEventListener('seeked', function () {
                    window.clearTimeout(that.seekingIndex);
                    audioElem.play();
                    document.getElementById('pp-pointer').removeAttribute('class');
                });
            }

            /**
             * Set or reset timeline pointer position
             *
             * @param {Number} index  Current pointer position
             */
        }, {
            key: 'setPointerPosition',
            value: function setPointerPosition(index) {
                var item = document.getElementsByClassName('pp-item'),
                    pointer = document.getElementById('pp-pointer'),
                    item_h = item[0].offsetHeight;

                // Store current item(Section) index
                this.itemsIndex = index;
                // Set timeline section style
                item[index - 1].children[0].className = 'currentSection';
                for (var i = 0, item_len = item.length; i < item_len; i++) {
                    i !== index - 1 ? item[i].children[0].removeAttribute('class') : null;
                }
                // Set timeline pointer position
                pointer.style.top = index * item_h - item_h / 2 - 6 + 'px';
            }

            /**
             * Convert time string to seconds
             *
             * @param {String} timeString  A time string 
             */
        }, {
            key: 'convertTime',
            value: function convertTime(timeString) {

                // Check time string
                PodPicker.isTimeString(timeString) ? null : PodPicker.throwError(PodPicker.ERROR_MSG.format_start);

                var timeArray = timeString.split(':'),
                    len = timeArray.length;

                switch (len) {

                    case 1:
                        return timeArray[0] * 1;
                        break;
                    case 2:
                        return timeArray[0] * 60 + timeArray[1] * 1;
                        break;
                    case 3:
                        return timeArray[0] * 60 * 60 + timeArray[1] * 60 + timeArray[2] * 1;
                        break;
                    default:
                        PodPicker.throwError(PodPicker.ERROR_MSG.format_start);
                }
            }

            /**
             * Error Messages
             *
             */
        }], [{
            key: 'throwError',

            /**
             * Throw Error
             *
             * @param {String} ERROR_MSG  Error message
             */
            value: function throwError(msg) {
                throw new Error(msg);
            }

            /**
             * Determines if a value is `undefined / string / boolean / array / object / hex color / timeString`
             *
             * @param {Any} value  The value need to be determined
             */
        }, {
            key: 'isUndefined',
            value: function isUndefined(value) {
                return typeof value === 'undefined';
            }
        }, {
            key: 'isString',
            value: function isString(value) {
                return typeof value === 'string';
            }
        }, {
            key: 'isBoolean',
            value: function isBoolean(value) {
                return typeof value === 'boolean';
            }
        }, {
            key: 'isArray',
            value: function isArray(value) {
                return value.constructor === Array;
            }
        }, {
            key: 'isObject',
            value: function isObject(value) {
                return value !== null && typeof value === 'object';
            }
        }, {
            key: 'isHexColor',
            value: function isHexColor(value) {
                // via http://stackoverflow.com/a/8027444/3786947
                return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value);
            }
        }, {
            key: 'isTimeString',
            value: function isTimeString(value) {
                return /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/.test(value);
            }
        }, {
            key: 'ERROR_MSG',
            get: function get() {
                return {
                    // `container` parameter
                    param_container: 'Pod Picker: `container` parameter is required',
                    type_container: 'Pod Picker: `container` parameter must be an string',
                    elem_container: 'Pod Picker: `container` parameter is not related to an existing ID',
                    // `items` parameter
                    param_items: 'Pod Picker: `items` parameter is required',
                    type_items: 'Pod Picker: `items` parameter must be an array',
                    empty_items: 'Pod Picker: `items` parameter cannot be an empty array',
                    // `options` parameter
                    type_options: 'Pod Picker: `options` parameter must be an object',
                    type_options_audioElem: 'Pod Picker: `options.audioElem` must be an string',
                    type_options_timelineColor: 'Pod Picker: `options.timelineColor` must be an string',
                    type_options_isShowStartTime: 'Pod Picker: `options.isShowStartTime` must be an boolean',
                    type_value_options_timelineColor: 'Pod Picker: `options.timelineColor` must be an hex color',
                    // others
                    format_audioFile: 'Pod Picker: does not support MP3 file format',
                    format_start: 'Pod Picker: `start` time string must be "hh:mm:ss", "mm:ss" or "ss" format'
                };
            }
        }]);

        return PodPicker;
    })()

    // Browser globals
    ;

    if (!window.PodPicker) {
        window.PodPicker = PodPicker;
    }
})(window, document);

// Register event handlers to `item` element