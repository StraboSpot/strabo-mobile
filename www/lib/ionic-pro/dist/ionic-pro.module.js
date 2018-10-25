(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['@ionic/pro'] = {})));
}(this, (function (exports) { 'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}











function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

// TODO: Combine these
var postJson = function (url, data) {
    return new Promise(function (resolve, reject) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('POST', url);
        xmlhttp.setRequestHeader('Content-Type', 'application/json');
        xmlhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                // Check if the status is in the 'OK' range
                if (this.status >= 200 && this.status < 400) {
                    var result = JSON.parse(xmlhttp.responseText);
                    resolve(result);
                }
                else {
                    try {
                        reject({
                            status: this.status,
                            response: JSON.parse(this.responseText)
                        });
                    }
                    catch (e) {
                        reject({
                            status: this.status
                        });
                    }
                }
            }
        };
        xmlhttp.send(JSON.stringify(data));
    });
};
var getJson = function (url) {
    return new Promise(function (resolve, reject) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', url);
        xmlhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    var result = JSON.parse(xmlhttp.responseText);
                    resolve(result);
                }
                else {
                    try {
                        reject({
                            status: this.status,
                            response: JSON.parse(this.responseText)
                        });
                    }
                    catch (e) {
                        reject({
                            status: this.status
                        });
                    }
                }
            }
        };
        xmlhttp.send();
    });
};

var Api = /** @class */ (function () {
    function Api(url) {
        this.url = url;
    }
    Api.prototype.post = function (endpoint, data) {
        return postJson(this.url + endpoint, data);
    };
    return Api;
}());

/**
 * Check if we're running in an Angular 1 context. If so,
 * extend the $exceptionHandler to report better errors.
 */
var checkIfAngular1 = function (app) {
    if (window.angular) {
        window.angular.module('ionic')
            .config(['$provide', function ($provide) {
                $provide.decorator('$exceptionHandler', ['$delegate', function ($delegate) {
                        return function (exception, cause) {
                            $delegate(exception, cause);
                            exception.message = exception.stack;
                            app.monitoring.handleNewError(exception);
                        };
                    }]);
            }]);
    }
};

// Base class for anything we'll send to the server: log message, stacktrace, etc.
var MonitoringCapture = /** @class */ (function () {
    function MonitoringCapture(fields) {
        for (var i in fields) {
            this[i] = fields[i];
        }
    }
    return MonitoringCapture;
}());

// A monitoring log message
var MonitoringLog = /** @class */ (function (_super) {
    __extends(MonitoringLog, _super);
    function MonitoringLog(msg, options, error, extra) {
        if (options === void 0) { options = { level: 'error' }; }
        if (extra === void 0) { extra = {}; }
        return _super.call(this, {
            type: 'log',
            message: msg,
            level: options.level,
            stack: error.stack,
            extra: extra
        }) || this;
    }
    return MonitoringLog;
}(MonitoringCapture));

// A monitoring exception message
var MonitoringException = /** @class */ (function (_super) {
    __extends(MonitoringException, _super);
    function MonitoringException(error, extra) {
        if (extra === void 0) { extra = {}; }
        var _this = _super.call(this, {
            type: 'exception',
            message: error.message,
            name: error.name,
            stack: error.stack,
            extra: extra
        }) || this;
        _this.clean(error);
        return _this;
    }
    MonitoringException.prototype.clean = function (err) {
        // handle HTTP errors differently
        if (err.url || err.headers) {
            err.isHttp = true;
        }
        err.timestamp = new Date;
        var aParser = document.createElement('a');
        var stack = err.stack;
        for (var _i = 0, stack_1 = stack; _i < stack_1.length; _i++) {
            var frame = stack_1[_i];
            this.cleanOffendingFile(aParser, frame);
            if (!this.isFrameInApp(frame)) {
                frame.in_app = false;
                frame.context = null;
                delete frame.context;
            }
            else {
                frame.in_app = true;
            }
        }
        return err;
    };
    /**
     * Some file URLS are bad, real bad. Including iOS with the full
     * path to some obscure location in the bundle.
     *
     * This cleans that up and tries to just remove the path relative to www
     * which should match the name of the sourcemap.
     */
    MonitoringException.prototype.cleanOffendingFile = function (a, frame) {
        var url = frame.url;
        a.href = url;
        var path = a.pathname;
        var fileEnding = path.lastIndexOf('/');
        var file = path.substr(fileEnding + 1);
        frame.url = file;
    };
    /**
     * Check if a given frame came from our app code.
     */
    MonitoringException.prototype.isFrameInApp = function (frame) {
        var not_app_files = ['vendor.js', 'polyfills.js'];
        var foundFiles = not_app_files.filter(function (file) {
            return frame.url.indexOf(file) >= 0;
        });
        return foundFiles.length === 0;
    };
    return MonitoringException;
}(MonitoringCapture));

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var tracekit$1 = createCommonjsModule(function (module) {
/**
 * https://github.com/csnover/TraceKit
 * @license MIT
 * @namespace TraceKit
 */
(function(window, undefined) {
if (!window) {
    return;
}

var TraceKit = {};
var _oldTraceKit = window.TraceKit;

// global reference to slice
var _slice = [].slice;
var UNKNOWN_FUNCTION = '?';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Error_types
var ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/;

/**
 * A better form of hasOwnProperty<br/>
 * Example: `_has(MainHostObject, property) === true/false`
 *
 * @param {Object} object to check property
 * @param {string} key to check
 * @return {Boolean} true if the object has the key and it is not inherited
 */
function _has(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

/**
 * Returns true if the parameter is undefined<br/>
 * Example: `_isUndefined(val) === true/false`
 *
 * @param {*} what Value to check
 * @return {Boolean} true if undefined and false otherwise
 */
function _isUndefined(what) {
    return typeof what === 'undefined';
}

/**
 * Export TraceKit out to another variable<br/>
 * Example: `var TK = TraceKit.noConflict()`
 * @return {Object} The TraceKit object
 * @memberof TraceKit
 */
TraceKit.noConflict = function noConflict() {
    window.TraceKit = _oldTraceKit;
    return TraceKit;
};

/**
 * Wrap any function in a TraceKit reporter<br/>
 * Example: `func = TraceKit.wrap(func);`
 *
 * @param {Function} func Function to be wrapped
 * @return {Function} The wrapped func
 * @memberof TraceKit
 */
TraceKit.wrap = function traceKitWrapper(func) {
    function wrapped() {
        try {
            return func.apply(this, arguments);
        } catch (e) {
            TraceKit.report(e);
            throw e;
        }
    }
    return wrapped;
};

/**
 * Cross-browser processing of unhandled exceptions
 *
 * Syntax:
 * ```js
 *   TraceKit.report.subscribe(function(stackInfo) { ... })
 *   TraceKit.report.unsubscribe(function(stackInfo) { ... })
 *   TraceKit.report(exception)
 *   try { ...code... } catch(ex) { TraceKit.report(ex); }
 * ```
 *
 * Supports:
 *   - Firefox: full stack trace with line numbers, plus column number
 *     on top frame; column number is not guaranteed
 *   - Opera: full stack trace with line and column numbers
 *   - Chrome: full stack trace with line and column numbers
 *   - Safari: line and column number for the top frame only; some frames
 *     may be missing, and column number is not guaranteed
 *   - IE: line and column number for the top frame only; some frames
 *     may be missing, and column number is not guaranteed
 *
 * In theory, TraceKit should work on all of the following versions:
 *   - IE5.5+ (only 8.0 tested)
 *   - Firefox 0.9+ (only 3.5+ tested)
 *   - Opera 7+ (only 10.50 tested; versions 9 and earlier may require
 *     Exceptions Have Stacktrace to be enabled in opera:config)
 *   - Safari 3+ (only 4+ tested)
 *   - Chrome 1+ (only 5+ tested)
 *   - Konqueror 3.5+ (untested)
 *
 * Requires TraceKit.computeStackTrace.
 *
 * Tries to catch all unhandled exceptions and report them to the
 * subscribed handlers. Please note that TraceKit.report will rethrow the
 * exception. This is REQUIRED in order to get a useful stack trace in IE.
 * If the exception does not reach the top of the browser, you will only
 * get a stack trace from the point where TraceKit.report was called.
 *
 * Handlers receive a TraceKit.StackTrace object as described in the
 * TraceKit.computeStackTrace docs.
 *
 * @memberof TraceKit
 * @namespace
 */
TraceKit.report = (function reportModuleWrapper() {
    var handlers = [],
        lastException = null,
        lastExceptionStack = null;

    /**
     * Add a crash handler.
     * @param {Function} handler
     * @memberof TraceKit.report
     */
    function subscribe(handler) {
        installGlobalHandler();
        handlers.push(handler);
    }

    /**
     * Remove a crash handler.
     * @param {Function} handler
     * @memberof TraceKit.report
     */
    function unsubscribe(handler) {
        for (var i = handlers.length - 1; i >= 0; --i) {
            if (handlers[i] === handler) {
                handlers.splice(i, 1);
            }
        }

        if (handlers.length === 0) {
            window.onerror = _oldOnerrorHandler;
            _onErrorHandlerInstalled = false;
        }
    }

    /**
     * Dispatch stack information to all handlers.
     * @param {TraceKit.StackTrace} stack
     * @param {boolean} isWindowError Is this a top-level window error?
     * @param {Error=} error The error that's being handled (if available, null otherwise)
     * @memberof TraceKit.report
     * @throws An exception if an error occurs while calling an handler.
     */
    function notifyHandlers(stack, isWindowError, error) {
        var exception = null;
        if (isWindowError && !TraceKit.collectWindowErrors) {
          return;
        }
        for (var i in handlers) {
            if (_has(handlers, i)) {
                try {
                    handlers[i](stack, isWindowError, error);
                } catch (inner) {
                    exception = inner;
                }
            }
        }

        if (exception) {
            throw exception;
        }
    }

    var _oldOnerrorHandler, _onErrorHandlerInstalled;

    /**
     * Ensures all global unhandled exceptions are recorded.
     * Supported by Gecko and IE.
     * @param {string} message Error message.
     * @param {string} url URL of script that generated the exception.
     * @param {(number|string)} lineNo The line number at which the error occurred.
     * @param {(number|string)=} columnNo The column number at which the error occurred.
     * @param {Error=} errorObj The actual Error object.
     * @memberof TraceKit.report
     */
    function traceKitWindowOnError(message, url, lineNo, columnNo, errorObj) {
        var stack = null;

        if (lastExceptionStack) {
            TraceKit.computeStackTrace.augmentStackTraceWithInitialElement(lastExceptionStack, url, lineNo, message);
    	    processLastException();
        } else if (errorObj) {
            stack = TraceKit.computeStackTrace(errorObj);
            notifyHandlers(stack, true, errorObj);
        } else {
            var location = {
              'url': url,
              'line': lineNo,
              'column': columnNo
            };

            var name;
            var msg = message; // must be new var or will modify original `arguments`
            if ({}.toString.call(message) === '[object String]') {
                var groups = message.match(ERROR_TYPES_RE);
                if (groups) {
                    name = groups[1];
                    msg = groups[2];
                }
            }

            location.func = TraceKit.computeStackTrace.guessFunctionName(location.url, location.line);
            location.context = TraceKit.computeStackTrace.gatherContext(location.url, location.line);
            stack = {
                'name': name,
                'message': msg,
                'mode': 'onerror',
                'stack': [location]
            };

            notifyHandlers(stack, true, null);
        }

        if (_oldOnerrorHandler) {
            return _oldOnerrorHandler.apply(this, arguments);
        }

        return false;
    }

    /**
     * Install a global onerror handler
     * @memberof TraceKit.report
     */
    function installGlobalHandler() {
        if (_onErrorHandlerInstalled === true) {
            return;
        }

        _oldOnerrorHandler = window.onerror;
        window.onerror = traceKitWindowOnError;
        _onErrorHandlerInstalled = true;
    }

    /**
     * Process the most recent exception
     * @memberof TraceKit.report
     */
    function processLastException() {
        var _lastExceptionStack = lastExceptionStack,
            _lastException = lastException;
        lastExceptionStack = null;
        lastException = null;
        notifyHandlers(_lastExceptionStack, false, _lastException);
    }

    /**
     * Reports an unhandled Error to TraceKit.
     * @param {Error} ex
     * @memberof TraceKit.report
     * @throws An exception if an incomplete stack trace is detected (old IE browsers).
     */
    function report(ex) {
        if (lastExceptionStack) {
            if (lastException === ex) {
                return; // already caught by an inner catch block, ignore
            } else {
              processLastException();
            }
        }

        var stack = TraceKit.computeStackTrace(ex);
        lastExceptionStack = stack;
        lastException = ex;

        // If the stack trace is incomplete, wait for 2 seconds for
        // slow slow IE to see if onerror occurs or not before reporting
        // this exception; otherwise, we will end up with an incomplete
        // stack trace
        setTimeout(function () {
            if (lastException === ex) {
                processLastException();
            }
        }, (stack.incomplete ? 2000 : 0));

        throw ex; // re-throw to propagate to the top level (and cause window.onerror)
    }

    report.subscribe = subscribe;
    report.unsubscribe = unsubscribe;
    return report;
}());

/**
 * An object representing a single stack frame.
 * @typedef {Object} StackFrame
 * @property {string} url The JavaScript or HTML file URL.
 * @property {string} func The function name, or empty for anonymous functions (if guessing did not work).
 * @property {string[]?} args The arguments passed to the function, if known.
 * @property {number=} line The line number, if known.
 * @property {number=} column The column number, if known.
 * @property {string[]} context An array of source code lines; the middle element corresponds to the correct line#.
 * @memberof TraceKit
 */

/**
 * An object representing a JavaScript stack trace.
 * @typedef {Object} StackTrace
 * @property {string} name The name of the thrown exception.
 * @property {string} message The exception error message.
 * @property {TraceKit.StackFrame[]} stack An array of stack frames.
 * @property {string} mode 'stack', 'stacktrace', 'multiline', 'callers', 'onerror', or 'failed' -- method used to collect the stack trace.
 * @memberof TraceKit
 */

/**
 * TraceKit.computeStackTrace: cross-browser stack traces in JavaScript
 *
 * Syntax:
 *   ```js
 *   s = TraceKit.computeStackTrace.ofCaller([depth])
 *   s = TraceKit.computeStackTrace(exception) // consider using TraceKit.report instead (see below)
 *   ```
 *
 * Supports:
 *   - Firefox:  full stack trace with line numbers and unreliable column
 *               number on top frame
 *   - Opera 10: full stack trace with line and column numbers
 *   - Opera 9-: full stack trace with line numbers
 *   - Chrome:   full stack trace with line and column numbers
 *   - Safari:   line and column number for the topmost stacktrace element
 *               only
 *   - IE:       no line numbers whatsoever
 *
 * Tries to guess names of anonymous functions by looking for assignments
 * in the source code. In IE and Safari, we have to guess source file names
 * by searching for function bodies inside all page scripts. This will not
 * work for scripts that are loaded cross-domain.
 * Here be dragons: some function names may be guessed incorrectly, and
 * duplicate functions may be mismatched.
 *
 * TraceKit.computeStackTrace should only be used for tracing purposes.
 * Logging of unhandled exceptions should be done with TraceKit.report,
 * which builds on top of TraceKit.computeStackTrace and provides better
 * IE support by utilizing the window.onerror event to retrieve information
 * about the top of the stack.
 *
 * Note: In IE and Safari, no stack trace is recorded on the Error object,
 * so computeStackTrace instead walks its *own* chain of callers.
 * This means that:
 *  * in Safari, some methods may be missing from the stack trace;
 *  * in IE, the topmost function in the stack trace will always be the
 *    caller of computeStackTrace.
 *
 * This is okay for tracing (because you are likely to be calling
 * computeStackTrace from the function you want to be the topmost element
 * of the stack trace anyway), but not okay for logging unhandled
 * exceptions (because your catch block will likely be far away from the
 * inner function that actually caused the exception).
 *
 * Tracing example:
 *  ```js
 *     function trace(message) {
 *         var stackInfo = TraceKit.computeStackTrace.ofCaller();
 *         var data = message + "\n";
 *         for(var i in stackInfo.stack) {
 *             var item = stackInfo.stack[i];
 *             data += (item.func || '[anonymous]') + "() in " + item.url + ":" + (item.line || '0') + "\n";
 *         }
 *         if (window.console)
 *             console.info(data);
 *         else
 *             alert(data);
 *     }
 * ```
 * @memberof TraceKit
 * @namespace
 */
TraceKit.computeStackTrace = (function computeStackTraceWrapper() {
    var debug = false,
        sourceCache = {};

    /**
     * Attempts to retrieve source code via XMLHttpRequest, which is used
     * to look up anonymous function names.
     * @param {string} url URL of source code.
     * @return {string} Source contents.
     * @memberof TraceKit.computeStackTrace
     */
    function loadSource(url) {
        if (!TraceKit.remoteFetching) { //Only attempt request if remoteFetching is on.
            return '';
        }
        try {
            var getXHR = function() {
                try {
                    return new window.XMLHttpRequest();
                } catch (e) {
                    // explicitly bubble up the exception if not found
                    return new window.ActiveXObject('Microsoft.XMLHTTP');
                }
            };

            var request = getXHR();
            request.open('GET', url, false);
            request.send('');
            return request.responseText;
        } catch (e) {
            return '';
        }
    }

    /**
     * Retrieves source code from the source code cache.
     * @param {string} url URL of source code.
     * @return {Array.<string>} Source contents.
     * @memberof TraceKit.computeStackTrace
     */
    function getSource(url) {
        if (typeof url !== 'string') {
            return [];
        }

        if (!_has(sourceCache, url)) {
            // URL needs to be able to fetched within the acceptable domain.  Otherwise,
            // cross-domain errors will be triggered.
            /*
                Regex matches:
                0 - Full Url
                1 - Protocol
                2 - Domain
                3 - Port (Useful for internal applications)
                4 - Path
            */
            var source = '';
            var domain = '';
            try { domain = window.document.domain; } catch (e) { }
            var match = /(.*)\:\/\/([^:\/]+)([:\d]*)\/{0,1}([\s\S]*)/.exec(url);
            if (match && match[2] === domain) {
                source = loadSource(url);
            }
            sourceCache[url] = source ? source.split('\n') : [];
        }

        return sourceCache[url];
    }

    /**
     * Tries to use an externally loaded copy of source code to determine
     * the name of a function by looking at the name of the variable it was
     * assigned to, if any.
     * @param {string} url URL of source code.
     * @param {(string|number)} lineNo Line number in source code.
     * @return {string} The function name, if discoverable.
     * @memberof TraceKit.computeStackTrace
     */
    function guessFunctionName(url, lineNo) {
        var reFunctionArgNames = /function ([^(]*)\(([^)]*)\)/,
            reGuessFunction = /['"]?([0-9A-Za-z$_]+)['"]?\s*[:=]\s*(function|eval|new Function)/,
            line = '',
            maxLines = 10,
            source = getSource(url),
            m;

        if (!source.length) {
            return UNKNOWN_FUNCTION;
        }

        // Walk backwards from the first line in the function until we find the line which
        // matches the pattern above, which is the function definition
        for (var i = 0; i < maxLines; ++i) {
            line = source[lineNo - i] + line;

            if (!_isUndefined(line)) {
                if ((m = reGuessFunction.exec(line))) {
                    return m[1];
                } else if ((m = reFunctionArgNames.exec(line))) {
                    return m[1];
                }
            }
        }

        return UNKNOWN_FUNCTION;
    }

    /**
     * Retrieves the surrounding lines from where an exception occurred.
     * @param {string} url URL of source code.
     * @param {(string|number)} line Line number in source code to center around for context.
     * @return {?Array.<string>} Lines of source code.
     * @memberof TraceKit.computeStackTrace
     */
    function gatherContext(url, line) {
        var source = getSource(url);

        if (!source.length) {
            return null;
        }

        var context = [],
            // linesBefore & linesAfter are inclusive with the offending line.
            // if linesOfContext is even, there will be one extra line
            //   *before* the offending line.
            linesBefore = Math.floor(TraceKit.linesOfContext / 2),
            // Add one extra line if linesOfContext is odd
            linesAfter = linesBefore + (TraceKit.linesOfContext % 2),
            start = Math.max(0, line - linesBefore - 1),
            end = Math.min(source.length, line + linesAfter - 1);

        line -= 1; // convert to 0-based index

        for (var i = start; i < end; ++i) {
            if (!_isUndefined(source[i])) {
                context.push(source[i]);
            }
        }

        return context.length > 0 ? context : null;
    }

    /**
     * Escapes special characters, except for whitespace, in a string to be
     * used inside a regular expression as a string literal.
     * @param {string} text The string.
     * @return {string} The escaped string literal.
     * @memberof TraceKit.computeStackTrace
     */
    function escapeRegExp(text) {
        return text.replace(/[\-\[\]{}()*+?.,\\\^$|#]/g, '\\$&');
    }

    /**
     * Escapes special characters in a string to be used inside a regular
     * expression as a string literal. Also ensures that HTML entities will
     * be matched the same as their literal friends.
     * @param {string} body The string.
     * @return {string} The escaped string.
     * @memberof TraceKit.computeStackTrace
     */
    function escapeCodeAsRegExpForMatchingInsideHTML(body) {
        return escapeRegExp(body).replace('<', '(?:<|&lt;)').replace('>', '(?:>|&gt;)').replace('&', '(?:&|&amp;)').replace('"', '(?:"|&quot;)').replace(/\s+/g, '\\s+');
    }

    /**
     * Determines where a code fragment occurs in the source code.
     * @param {RegExp} re The function definition.
     * @param {Array.<string>} urls A list of URLs to search.
     * @return {?Object.<string, (string|number)>} An object containing
     * the url, line, and column number of the defined function.
     * @memberof TraceKit.computeStackTrace
     */
    function findSourceInUrls(re, urls) {
        var source, m;
        for (var i = 0, j = urls.length; i < j; ++i) {
            if ((source = getSource(urls[i])).length) {
                source = source.join('\n');
                if ((m = re.exec(source))) {

                    return {
                        'url': urls[i],
                        'line': source.substring(0, m.index).split('\n').length,
                        'column': m.index - source.lastIndexOf('\n', m.index) - 1
                    };
                }
            }
        }

        return null;
    }

    /**
     * Determines at which column a code fragment occurs on a line of the
     * source code.
     * @param {string} fragment The code fragment.
     * @param {string} url The URL to search.
     * @param {(string|number)} line The line number to examine.
     * @return {?number} The column number.
     * @memberof TraceKit.computeStackTrace
     */
    function findSourceInLine(fragment, url, line) {
        var source = getSource(url),
            re = new RegExp('\\b' + escapeRegExp(fragment) + '\\b'),
            m;

        line -= 1;

        if (source && source.length > line && (m = re.exec(source[line]))) {
            return m.index;
        }

        return null;
    }

    /**
     * Determines where a function was defined within the source code.
     * @param {(Function|string)} func A function reference or serialized
     * function definition.
     * @return {?Object.<string, (string|number)>} An object containing
     * the url, line, and column number of the defined function.
     * @memberof TraceKit.computeStackTrace
     */
    function findSourceByFunctionBody(func) {
        if (_isUndefined(window && window.document)) {
            return;
        }

        var urls = [window.location.href],
            scripts = window.document.getElementsByTagName('script'),
            body,
            code = '' + func,
            codeRE = /^function(?:\s+([\w$]+))?\s*\(([\w\s,]*)\)\s*\{\s*(\S[\s\S]*\S)\s*\}\s*$/,
            eventRE = /^function on([\w$]+)\s*\(event\)\s*\{\s*(\S[\s\S]*\S)\s*\}\s*$/,
            re,
            parts,
            result;

        for (var i = 0; i < scripts.length; ++i) {
            var script = scripts[i];
            if (script.src) {
                urls.push(script.src);
            }
        }

        if (!(parts = codeRE.exec(code))) {
            re = new RegExp(escapeRegExp(code).replace(/\s+/g, '\\s+'));
        }

        // not sure if this is really necessary, but I don’t have a test
        // corpus large enough to confirm that and it was in the original.
        else {
            var name = parts[1] ? '\\s+' + parts[1] : '',
                args = parts[2].split(',').join('\\s*,\\s*');

            body = escapeRegExp(parts[3]).replace(/;$/, ';?'); // semicolon is inserted if the function ends with a comment.replace(/\s+/g, '\\s+');
            re = new RegExp('function' + name + '\\s*\\(\\s*' + args + '\\s*\\)\\s*{\\s*' + body + '\\s*}');
        }

        // look for a normal function definition
        if ((result = findSourceInUrls(re, urls))) {
            return result;
        }

        // look for an old-school event handler function
        if ((parts = eventRE.exec(code))) {
            var event = parts[1];
            body = escapeCodeAsRegExpForMatchingInsideHTML(parts[2]);

            // look for a function defined in HTML as an onXXX handler
            re = new RegExp('on' + event + '=[\\\'"]\\s*' + body + '\\s*[\\\'"]', 'i');

            if ((result = findSourceInUrls(re, urls[0]))) {
                return result;
            }

            // look for ???
            re = new RegExp(body);

            if ((result = findSourceInUrls(re, urls))) {
                return result;
            }
        }

        return null;
    }

    // Contents of Exception in various browsers.
    //
    // SAFARI:
    // ex.message = Can't find variable: qq
    // ex.line = 59
    // ex.sourceId = 580238192
    // ex.sourceURL = http://...
    // ex.expressionBeginOffset = 96
    // ex.expressionCaretOffset = 98
    // ex.expressionEndOffset = 98
    // ex.name = ReferenceError
    //
    // FIREFOX:
    // ex.message = qq is not defined
    // ex.fileName = http://...
    // ex.lineNumber = 59
    // ex.columnNumber = 69
    // ex.stack = ...stack trace... (see the example below)
    // ex.name = ReferenceError
    //
    // CHROME:
    // ex.message = qq is not defined
    // ex.name = ReferenceError
    // ex.type = not_defined
    // ex.arguments = ['aa']
    // ex.stack = ...stack trace...
    //
    // INTERNET EXPLORER:
    // ex.message = ...
    // ex.name = ReferenceError
    //
    // OPERA:
    // ex.message = ...message... (see the example below)
    // ex.name = ReferenceError
    // ex.opera#sourceloc = 11  (pretty much useless, duplicates the info in ex.message)
    // ex.stacktrace = n/a; see 'opera:config#UserPrefs|Exceptions Have Stacktrace'

    /**
     * Computes stack trace information from the stack property.
     * Chrome and Gecko use this property.
     * @param {Error} ex
     * @return {?TraceKit.StackTrace} Stack trace information.
     * @memberof TraceKit.computeStackTrace
     */
    function computeStackTraceFromStackProp(ex) {
        if (!ex.stack) {
            return null;
        }

        var chrome = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
            gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i,
            winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i,

            // Used to additionally parse URL/line/column from eval frames
            isEval,
            geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
            chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/,

            lines = ex.stack.split('\n'),
            stack = [],
            submatch,
            parts,
            element,
            reference = /^(.*) is undefined$/.exec(ex.message);

        for (var i = 0, j = lines.length; i < j; ++i) {
            if ((parts = chrome.exec(lines[i]))) {
                var isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
                isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
                if (isEval && (submatch = chromeEval.exec(parts[2]))) {
                    // throw out eval line/column and use top-most line/column number
                    parts[2] = submatch[1]; // url
                    parts[3] = submatch[2]; // line
                    parts[4] = submatch[3]; // column
                }
                element = {
                    'url': !isNative ? parts[2] : null,
                    'func': parts[1] || UNKNOWN_FUNCTION,
                    'args': isNative ? [parts[2]] : [],
                    'line': parts[3] ? +parts[3] : null,
                    'column': parts[4] ? +parts[4] : null
                };
            } else if ( parts = winjs.exec(lines[i]) ) {
                element = {
                    'url': parts[2],
                    'func': parts[1] || UNKNOWN_FUNCTION,
                    'args': [],
                    'line': +parts[3],
                    'column': parts[4] ? +parts[4] : null
                };
            } else if ((parts = gecko.exec(lines[i]))) {
                isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
                if (isEval && (submatch = geckoEval.exec(parts[3]))) {
                    // throw out eval line/column and use top-most line number
                    parts[3] = submatch[1];
                    parts[4] = submatch[2];
                    parts[5] = null; // no column when eval
                } else if (i === 0 && !parts[5] && !_isUndefined(ex.columnNumber)) {
                    // FireFox uses this awesome columnNumber property for its top frame
                    // Also note, Firefox's column number is 0-based and everything else expects 1-based,
                    // so adding 1
                    // NOTE: this hack doesn't work if top-most frame is eval
                    stack[0].column = ex.columnNumber + 1;
                }
                element = {
                    'url': parts[3],
                    'func': parts[1] || UNKNOWN_FUNCTION,
                    'args': parts[2] ? parts[2].split(',') : [],
                    'line': parts[4] ? +parts[4] : null,
                    'column': parts[5] ? +parts[5] : null
                };
            } else {
                continue;
            }

            if (!element.func && element.line) {
                element.func = guessFunctionName(element.url, element.line);
            }

            element.context = element.line ? gatherContext(element.url, element.line) : null;
            stack.push(element);
        }

        if (!stack.length) {
            return null;
        }

        if (stack[0] && stack[0].line && !stack[0].column && reference) {
            stack[0].column = findSourceInLine(reference[1], stack[0].url, stack[0].line);
        }

        return {
            'mode': 'stack',
            'name': ex.name,
            'message': ex.message,
            'stack': stack
        };
    }

    /**
     * Computes stack trace information from the stacktrace property.
     * Opera 10+ uses this property.
     * @param {Error} ex
     * @return {?TraceKit.StackTrace} Stack trace information.
     * @memberof TraceKit.computeStackTrace
     */
    function computeStackTraceFromStacktraceProp(ex) {
        // Access and store the stacktrace property before doing ANYTHING
        // else to it because Opera is not very good at providing it
        // reliably in other circumstances.
        var stacktrace = ex.stacktrace;
        if (!stacktrace) {
            return;
        }

        var opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i,
            opera11Regex = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^\)]+))\((.*)\))? in (.*):\s*$/i,
            lines = stacktrace.split('\n'),
            stack = [],
            parts;

        for (var line = 0; line < lines.length; line += 2) {
            var element = null;
            if ((parts = opera10Regex.exec(lines[line]))) {
                element = {
                    'url': parts[2],
                    'line': +parts[1],
                    'column': null,
                    'func': parts[3],
                    'args':[]
                };
            } else if ((parts = opera11Regex.exec(lines[line]))) {
                element = {
                    'url': parts[6],
                    'line': +parts[1],
                    'column': +parts[2],
                    'func': parts[3] || parts[4],
                    'args': parts[5] ? parts[5].split(',') : []
                };
            }

            if (element) {
                if (!element.func && element.line) {
                    element.func = guessFunctionName(element.url, element.line);
                }
                if (element.line) {
                    try {
                        element.context = gatherContext(element.url, element.line);
                    } catch (exc) {}
                }

                if (!element.context) {
                    element.context = [lines[line + 1]];
                }

                stack.push(element);
            }
        }

        if (!stack.length) {
            return null;
        }

        return {
            'mode': 'stacktrace',
            'name': ex.name,
            'message': ex.message,
            'stack': stack
        };
    }

    /**
     * NOT TESTED.
     * Computes stack trace information from an error message that includes
     * the stack trace.
     * Opera 9 and earlier use this method if the option to show stack
     * traces is turned on in opera:config.
     * @param {Error} ex
     * @return {?TraceKit.StackTrace} Stack information.
     * @memberof TraceKit.computeStackTrace
     */
    function computeStackTraceFromOperaMultiLineMessage(ex) {
        // TODO: Clean this function up
        // Opera includes a stack trace into the exception message. An example is:
        //
        // Statement on line 3: Undefined variable: undefinedFunc
        // Backtrace:
        //   Line 3 of linked script file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.js: In function zzz
        //         undefinedFunc(a);
        //   Line 7 of inline#1 script in file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.html: In function yyy
        //           zzz(x, y, z);
        //   Line 3 of inline#1 script in file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.html: In function xxx
        //           yyy(a, a, a);
        //   Line 1 of function script
        //     try { xxx('hi'); return false; } catch(ex) { TraceKit.report(ex); }
        //   ...

        var lines = ex.message.split('\n');
        if (lines.length < 4) {
            return null;
        }

        var lineRE1 = /^\s*Line (\d+) of linked script ((?:file|https?|blob)\S+)(?:: in function (\S+))?\s*$/i,
            lineRE2 = /^\s*Line (\d+) of inline#(\d+) script in ((?:file|https?|blob)\S+)(?:: in function (\S+))?\s*$/i,
            lineRE3 = /^\s*Line (\d+) of function script\s*$/i,
            stack = [],
            scripts = (window && window.document && window.document.getElementsByTagName('script')),
            inlineScriptBlocks = [],
            parts;

        for (var s in scripts) {
            if (_has(scripts, s) && !scripts[s].src) {
                inlineScriptBlocks.push(scripts[s]);
            }
        }

        for (var line = 2; line < lines.length; line += 2) {
            var item = null;
            if ((parts = lineRE1.exec(lines[line]))) {
                item = {
                    'url': parts[2],
                    'func': parts[3],
                    'args': [],
                    'line': +parts[1],
                    'column': null
                };
            } else if ((parts = lineRE2.exec(lines[line]))) {
                item = {
                    'url': parts[3],
                    'func': parts[4],
                    'args': [],
                    'line': +parts[1],
                    'column': null // TODO: Check to see if inline#1 (+parts[2]) points to the script number or column number.
                };
                var relativeLine = (+parts[1]); // relative to the start of the <SCRIPT> block
                var script = inlineScriptBlocks[parts[2] - 1];
                if (script) {
                    var source = getSource(item.url);
                    if (source) {
                        source = source.join('\n');
                        var pos = source.indexOf(script.innerText);
                        if (pos >= 0) {
                            item.line = relativeLine + source.substring(0, pos).split('\n').length;
                        }
                    }
                }
            } else if ((parts = lineRE3.exec(lines[line]))) {
                var url = window.location.href.replace(/#.*$/, '');
                var re = new RegExp(escapeCodeAsRegExpForMatchingInsideHTML(lines[line + 1]));
                var src = findSourceInUrls(re, [url]);
                item = {
                    'url': url,
                    'func': '',
                    'args': [],
                    'line': src ? src.line : parts[1],
                    'column': null
                };
            }

            if (item) {
                if (!item.func) {
                    item.func = guessFunctionName(item.url, item.line);
                }
                var context = gatherContext(item.url, item.line);
                var midline = (context ? context[Math.floor(context.length / 2)] : null);
                if (context && midline.replace(/^\s*/, '') === lines[line + 1].replace(/^\s*/, '')) {
                    item.context = context;
                } else {
                    // if (context) alert("Context mismatch. Correct midline:\n" + lines[i+1] + "\n\nMidline:\n" + midline + "\n\nContext:\n" + context.join("\n") + "\n\nURL:\n" + item.url);
                    item.context = [lines[line + 1]];
                }
                stack.push(item);
            }
        }
        if (!stack.length) {
            return null; // could not parse multiline exception message as Opera stack trace
        }

        return {
            'mode': 'multiline',
            'name': ex.name,
            'message': lines[0],
            'stack': stack
        };
    }

    /**
     * Adds information about the first frame to incomplete stack traces.
     * Safari and IE require this to get complete data on the first frame.
     * @param {TraceKit.StackTrace} stackInfo Stack trace information from
     * one of the compute* methods.
     * @param {string} url The URL of the script that caused an error.
     * @param {(number|string)} lineNo The line number of the script that
     * caused an error.
     * @param {string=} message The error generated by the browser, which
     * hopefully contains the name of the object that caused the error.
     * @return {boolean} Whether or not the stack information was
     * augmented.
     * @memberof TraceKit.computeStackTrace
     */
    function augmentStackTraceWithInitialElement(stackInfo, url, lineNo, message) {
        var initial = {
            'url': url,
            'line': lineNo
        };

        if (initial.url && initial.line) {
            stackInfo.incomplete = false;

            if (!initial.func) {
                initial.func = guessFunctionName(initial.url, initial.line);
            }

            if (!initial.context) {
                initial.context = gatherContext(initial.url, initial.line);
            }

            var reference = / '([^']+)' /.exec(message);
            if (reference) {
                initial.column = findSourceInLine(reference[1], initial.url, initial.line);
            }

            if (stackInfo.stack.length > 0) {
                if (stackInfo.stack[0].url === initial.url) {
                    if (stackInfo.stack[0].line === initial.line) {
                        return false; // already in stack trace
                    } else if (!stackInfo.stack[0].line && stackInfo.stack[0].func === initial.func) {
                        stackInfo.stack[0].line = initial.line;
                        stackInfo.stack[0].context = initial.context;
                        return false;
                    }
                }
            }

            stackInfo.stack.unshift(initial);
            stackInfo.partial = true;
            return true;
        } else {
            stackInfo.incomplete = true;
        }

        return false;
    }

    /**
     * Computes stack trace information by walking the arguments.caller
     * chain at the time the exception occurred. This will cause earlier
     * frames to be missed but is the only way to get any stack trace in
     * Safari and IE. The top frame is restored by
     * {@link augmentStackTraceWithInitialElement}.
     * @param {Error} ex
     * @return {TraceKit.StackTrace=} Stack trace information.
     * @memberof TraceKit.computeStackTrace
     */
    function computeStackTraceByWalkingCallerChain(ex, depth) {
        var functionName = /function\s+([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?\s*\(/i,
            stack = [],
            funcs = {},
            recursion = false,
            parts,
            item,
            source;

        for (var curr = computeStackTraceByWalkingCallerChain.caller; curr && !recursion; curr = curr.caller) {
            if (curr === computeStackTrace || curr === TraceKit.report) {
                continue;
            }

            item = {
                'url': null,
                'func': UNKNOWN_FUNCTION,
                'args': [],
                'line': null,
                'column': null
            };

            if (curr.name) {
                item.func = curr.name;
            } else if ((parts = functionName.exec(curr.toString()))) {
                item.func = parts[1];
            }

            if (typeof item.func === 'undefined') {
              try {
                item.func = parts.input.substring(0, parts.input.indexOf('{'));
              } catch (e) { }
            }

            if ((source = findSourceByFunctionBody(curr))) {
                item.url = source.url;
                item.line = source.line;

                if (item.func === UNKNOWN_FUNCTION) {
                    item.func = guessFunctionName(item.url, item.line);
                }

                var reference = / '([^']+)' /.exec(ex.message || ex.description);
                if (reference) {
                    item.column = findSourceInLine(reference[1], source.url, source.line);
                }
            }

            if (funcs['' + curr]) {
                recursion = true;
            }else{
                funcs['' + curr] = true;
            }

            stack.push(item);
        }

        if (depth) {
            stack.splice(0, depth);
        }

        var result = {
            'mode': 'callers',
            'name': ex.name,
            'message': ex.message,
            'stack': stack
        };
        augmentStackTraceWithInitialElement(result, ex.sourceURL || ex.fileName, ex.line || ex.lineNumber, ex.message || ex.description);
        return result;
    }

    /**
     * Computes a stack trace for an exception.
     * @param {Error} ex
     * @param {(string|number)=} depth
     * @memberof TraceKit.computeStackTrace
     */
    function computeStackTrace(ex, depth) {
        var stack = null;
        depth = (depth == null ? 0 : +depth);

        try {
            // This must be tried first because Opera 10 *destroys*
            // its stacktrace property if you try to access the stack
            // property first!!
            stack = computeStackTraceFromStacktraceProp(ex);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        try {
            stack = computeStackTraceFromStackProp(ex);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        try {
            stack = computeStackTraceFromOperaMultiLineMessage(ex);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        try {
            stack = computeStackTraceByWalkingCallerChain(ex, depth + 1);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        return {
            'name': ex.name,
            'message': ex.message,
            'mode': 'failed'
        };
    }

    /**
     * Logs a stacktrace starting from the previous call and working down.
     * @param {(number|string)=} depth How many frames deep to trace.
     * @return {TraceKit.StackTrace} Stack trace information.
     * @memberof TraceKit.computeStackTrace
     */
    function computeStackTraceOfCaller(depth) {
        depth = (depth == null ? 0 : +depth) + 1; // "+ 1" because "ofCaller" should drop one frame
        try {
            throw new Error();
        } catch (ex) {
            return computeStackTrace(ex, depth + 1);
        }
    }

    computeStackTrace.augmentStackTraceWithInitialElement = augmentStackTraceWithInitialElement;
    computeStackTrace.computeStackTraceFromStackProp = computeStackTraceFromStackProp;
    computeStackTrace.guessFunctionName = guessFunctionName;
    computeStackTrace.gatherContext = gatherContext;
    computeStackTrace.ofCaller = computeStackTraceOfCaller;
    computeStackTrace.getSource = getSource;

    return computeStackTrace;
}());

/**
 * Extends support for global error handling for asynchronous browser
 * functions. Adopted from Closure Library's errorhandler.js
 * @memberof TraceKit
 */
TraceKit.extendToAsynchronousCallbacks = function () {
    var _helper = function _helper(fnName) {
        var originalFn = window[fnName];
        window[fnName] = function traceKitAsyncExtension() {
            // Make a copy of the arguments
            var args = _slice.call(arguments);
            var originalCallback = args[0];
            if (typeof (originalCallback) === 'function') {
                args[0] = TraceKit.wrap(originalCallback);
            }
            // IE < 9 doesn't support .call/.apply on setInterval/setTimeout, but it
            // also only supports 2 argument and doesn't care what "this" is, so we
            // can just call the original function directly.
            if (originalFn.apply) {
                return originalFn.apply(this, args);
            } else {
                return originalFn(args[0], args[1]);
            }
        };
    };

    _helper('setTimeout');
    _helper('setInterval');
};

//Default options:
if (!TraceKit.remoteFetching) {
    TraceKit.remoteFetching = false;
}
if (!TraceKit.collectWindowErrors) {
    TraceKit.collectWindowErrors = true;
}
if (!TraceKit.linesOfContext || TraceKit.linesOfContext < 1) {
    // 5 lines before, the offending line, 5 lines after
    TraceKit.linesOfContext = 11;
}

// UMD export
if (typeof undefined === 'function' && undefined.amd) {
    undefined('TraceKit', [], TraceKit);
} else if ('object' !== 'undefined' && module.exports && window.module !== module) {
    module.exports = TraceKit;
} else {
    window.TraceKit = TraceKit;
}

}(typeof window !== 'undefined' ? window : commonjsGlobal));
});

var tracekit_1 = tracekit$1.report;
var tracekit_2 = tracekit$1.computeStackTrace;

var isError = function (value) {
    var strVal = {}.toString.call(value);
    switch (strVal) {
        case '[object Error]':
            return true;
        case '[object Exception]':
            return true;
        case '[object DOMException]':
            return true;
        default:
            return value instanceof Error;
    }
};
var Monitoring = /** @class */ (function () {
    function Monitoring(app) {
        var _this = this;
        this.app = app;
        this.queue = [];
        this.framework = app.getFramework();
        this.appId = app.appId;
        tracekit_1.subscribe(function (errorReport) {
            // Sometimes we get ErrorEvent instead of a string for message,
            // and these are useless, so we skip them.
            if (typeof errorReport.message !== 'string') {
                return;
            }
            var error = new MonitoringException(errorReport);
            _this.handleCapture(error);
        });
        this.initPromise = this.init();
    }
    /**
     * Initialize the monitoring plugin by first grabbing device and deploy
     * plugin info, and then identifying the user.
     */
    Monitoring.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var deviceInfo, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.app.device.loadDeviceInfo()];
                    case 1:
                        deviceInfo = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        console.error('Error loading device information. Continuing with basic data', e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle a new error from a given exception.
     */
    Monitoring.prototype.handleNewError = function (err, extra) {
        if (!isError(err)) {
            return this.log(err, {
                level: 'error',
                syntheticTrace: true
            }, extra);
        }
        var stack = tracekit_2(err);
        var error = new MonitoringException(stack, extra);
        this.handleCapture(error);
    };
    /**
     * Returns a wrapped function that catches errors automatically and track them.
     */
    Monitoring.prototype.wrap = function (fn, extra) {
        var _this = this;
        return function () {
            return _this.call(fn, extra);
        };
    };
    /**
     * Call a function and automatically catch errors and track them
     */
    Monitoring.prototype.call = function (fn, extra) {
        try {
            return fn.apply(this, arguments);
        }
        catch (e) {
            this.handleNewError(e, extra);
            throw e;
        }
    };
    /**
     * Log a message to the monitoring service.
     */
    Monitoring.prototype.log = function (msg, options, extra) {
        var ex;
        // Throw a synthetic event to capture a stack for logging
        try {
            throw new Error(msg);
        }
        catch (e) {
            ex = e;
        }
        // If we have a synthetic exception, grab the trace
        var newStack = tracekit_2(ex);
        var log = new MonitoringLog(msg, options, newStack, extra);
        this.handleCapture(log);
    };
    /**
     * Send a custom exception to the monitoring service.
     */
    Monitoring.prototype.exception = function (err, extra) {
        this.handleNewError(err, extra);
    };
    Monitoring.prototype.handleCapture = function (err) {
        var _this = this;
        if (!err) {
            return;
        }
        this.initPromise.then(function () {
            _this.queue.push(err);
            if (!_this.timerId) {
                // If we haven't set a timeout to drain, do it now
                // This means every N seconds we'll do a batch but not ever
                // wait more than N seconds to avoid crazy situations where
                // an exception repeats and we keep delaying the timer
                _this.timerId = setTimeout(function () {
                    _this.drainQueue();
                }, _this.app.options.monitoringSyncFrequency);
            }
        });
    };
    Monitoring.prototype.drainQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var manifest, payload, _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        clearTimeout(this.timerId);
                        this.timerId = null;
                        manifest = (this.app.manifest.data && this.app.manifest.data.ionic) || {};
                        _a = {
                            app_id: this.appId,
                            framework: this.framework,
                            device: this.app.device.getInfo()
                        };
                        _b = {
                            version: manifest.app_version
                        };
                        return [4 /*yield*/, this.app.getSnapshotId()];
                    case 1:
                        _b.snapshot_id = (_c.sent()) || manifest.snapshot_id;
                        return [4 /*yield*/, this.app.getChannel()];
                    case 2:
                        payload = (_a.pro = (_b.channel = (_c.sent()) || manifest.channel,
                            _b.ts = +new Date,
                            _b),
                            _a.errors = this.queue.slice(),
                            _a);
                        this.app.api.post("/monitoring/" + this.app.appId + "/exceptions", payload)
                            .catch(function (err) {
                            console.error('Unable to send exception to server', err);
                            if (err.response && err.response.error === 'no_such_app') {
                                console.warn("No such app with App ID " + _this.app.appId + ". Verify the App ID matches an app on Ionic Pro");
                            }
                        });
                        this.queue.length = 0;
                        return [2 /*return*/];
                }
            });
        });
    };
    return Monitoring;
}());

/*
  if (result.error === "no_such_app") {
    console.error('Unable to send errors to Ionic Pro, the app ' + appId + ' does not exist. Check the App ID and try again.');
    console.error('See the docs for more info: http://ionicframework.com/docs/pro/error-monitoring.html');
  }
  if (result.error === "bad_config") {
    console.error('Your Ionic Pro client is improperly configured. Check that your provided data-app-version exists and follows semver.');
    console.error('See the docs for more info: http://ionicframework.com/docs/pro/error-monitoring.html');
  }
*/

/**
 * AppManifest parses the manifest.json which is a standard file for PWA
 * metadata. We inject a few custom fields into this for helping identify
 * snapshots/channels in Pro.
 */
var AppManifest = /** @class */ (function () {
    function AppManifest() {
    }
    AppManifest.prototype.saveManifest = function (data) {
        this.data = data;
    };
    AppManifest.prototype.load = function () {
        var _this = this;
        var path = 'manifest.json';
        if (this.data) {
            return Promise.resolve(this.data);
        }
        return new Promise(function (resolve, reject) {
            return getJson(path).then(function (data) {
                _this.saveManifest(data);
                return resolve(_this.data);
            }, function (err) {
                console.error('Unable to parse manifest.json. Ensure the file is valid JSON');
                console.error(err);
                return reject(err);
            });
        });
    };
    return AppManifest;
}());

var assign = function (target) {
    var objs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objs[_i - 1] = arguments[_i];
    }
    var to = Object(target);
    for (var _a = 0, objs_1 = objs; _a < objs_1.length; _a++) {
        var nextSource = objs_1[_a];
        if (nextSource != null) { // Skip over if undefined or null
            for (var nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
};

var Device = /** @class */ (function () {
    function Device(app) {
        this.app = app;
        this.deviceInfo = {};
        this.app = app;
        this.codeVersion = app.version;
    }
    Device.prototype.getInfo = function () {
        return this.deviceInfo;
    };
    Device.prototype.loadDeviceInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            if (window.cordova) {
                                document.addEventListener('deviceready', function () {
                                    _this.queryDeviceInfo().then(function (info) {
                                        _this.deviceInfo = info;
                                        resolve(info);
                                    });
                                });
                            }
                            else {
                                var finishLoad = function () {
                                    _this.queryDeviceInfo().then(function (info) {
                                        _this.deviceInfo = info;
                                        resolve(info);
                                    });
                                };
                                if (document.readyState === 'complete') {
                                    finishLoad();
                                }
                                else {
                                    window.addEventListener('load', finishLoad.bind(_this));
                                }
                            }
                        }, 20); // give cordova some time to be on window
                    })];
            });
        });
    };
    Device.prototype.tryGetOS = function () {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        // Windows Phone must come first because its UA also contains "Android"
        if (/windows phone/i.test(userAgent)) {
            return 'wp';
        }
        if (/android/i.test(userAgent)) {
            return 'android';
        }
        // iOS detection from: http://stackoverflow.com/a/9039885/177710
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return 'ios';
        }
        return 'desktop';
    };
    // Collect browser information
    Device.prototype.getBrowserInfo = function () {
        var n = window.navigator;
        return {
            browserMobileOS: this.tryGetOS(),
            browserProduct: n.product,
            browserAppVersion: n.appVersion,
            browserUserAgent: n.userAgent,
            browserPlatform: n.platform,
            browserLanguage: n.language,
            browserAppName: n.appName,
            browserAppCodeName: n.appCodeName,
            viewportWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            viewportHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
            utcOffset: -(new Date().getTimezoneOffset() / 60)
        };
    };
    // Collect device information, including native device data if available
    Device.prototype.queryDeviceInfo = function () {
        var _this = this;
        var codeVersion = this.codeVersion;
        return new Promise(function (resolve, reject) {
            var info = {
                version: codeVersion,
                proClientVersion: "2.0.3"
            };
            // Try to grab some device info
            var d = window.device;
            if (d) {
                assign(info, {
                    model: d.model,
                    platform: d.platform,
                    uuid: d.uuid,
                    osVersion: d.version,
                    serial: d.serial,
                    manufacturer: d.manufacturer,
                    isNative: true,
                });
            }
            assign(info, _this.getBrowserInfo());
            // Grab app info from the native side
            if (!window.IonicCordova) {
                console.error('the cordova-plugin-ionic plugin is not installed. Install it for better device information for runtime errors.');
                return resolve(info);
            }
            window.IonicCordova.getAppInfo(function (appInfo) {
                appInfo['nativeVersion'] = appInfo.version;
                delete appInfo['version'];
                var newInfo = assign(info, appInfo);
                resolve(newInfo);
            }, function (err) {
                reject(err);
            });
        });
    };
    return Device;
}());

var uuidv4 = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

var DEFAULT_OPTIONS = {
    apiUrl: 'https://api.ionicjs.com',
    pluginResolveTimeout: 1000,
    monitoringSyncFrequency: 2000,
};
/**
 * Pro is the main entry class for the rest of the Pro client.
 */
var Pro = /** @class */ (function () {
    function Pro(appId, customOptions) {
        if (customOptions === void 0) { customOptions = {}; }
        var _this = this;
        this.appId = appId;
        this.options = DEFAULT_OPTIONS;
        this.deviceInfo = {};
        console.log('Ionic Pro initializing (app id: %c' + this.appId + '%c)', 'color: blue', 'color: black');
        this.options = assign.apply(void 0, [{}].concat(this.options, [customOptions]));
        this.version = this.options.appVersion;
        this.platformReadyPromise = this.watchPlatformReady();
        this.device = new Device(this);
        this.api = new Api(this.options.apiUrl);
        // Get unique ID for user (anonymous)
        var uid = this.createUid();
        this.uid = uid;
        // Initialize services
        this._monitoring = new Monitoring(this);
        this.manifest = new AppManifest();
        this.manifest.load();
        this._deployProxy = {
            get: function (target, property) {
                return function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            console.warn('IonicCordova is not available.' +
                                'Enabling debug mode and proxying requests to avoid errors.');
                            console.warn.apply(console, [property.toString() + " called with arguments"].concat(args));
                            return [2 /*return*/];
                        });
                    });
                };
            }
        };
    }
    /**
     * Main entry point. Bootstraps the Ionic Pro client.
     */
    Pro.init = function (appId, options) {
        if (options === void 0) { options = {}; }
        var pro = new Pro(appId, options);
        checkIfAngular1(pro);
        Pro._instance = pro;
        return pro;
    };
    /**
     * Get the singleton App instance.
     */
    Pro.getApp = function () {
        return this._instance;
    };
    Object.defineProperty(Pro.prototype, "monitoring", {
        get: function () {
            return this._monitoring;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Pro.prototype, "deploy", {
        get: function () {
            return window.IonicCordova && window.IonicCordova.deploy || new Proxy({}, this._deployProxy);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Pro, "monitoring", {
        /**
         * Interact with Ionic Monitoring using these functions.
         * @tutorial
         * To see examples of Pro.monitoring, please see our docs: https://ionicframework.com/docs/pro/monitoring/.
         */
        get: function () {
            return this.getApp()._monitoring;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Pro, "deploy", {
        get: function () {
            return window.IonicCordova && window.IonicCordova.deploy || new Proxy({}, Pro._instance._deployProxy);
        },
        enumerable: true,
        configurable: true
    });
    // TODO: Obvs want to change this in future
    /**
     * Get which framework we're running on, if any.
     */
    Pro.prototype.getFramework = function () {
        return window.angular ? 'angular1' : 'angular2';
    };
    /**
     * @return the ID for this app.
     */
    Pro.prototype.getAppId = function () {
        return this.appId;
    };
    /**
     * @return a reference to the Ionic Pro Cordova Plugin (if running in Cordova).
     */
    Pro.prototype.getPlugin = function () {
        return this.platformReady().then(function (platformInfo) {
            if (platformInfo.system === 'cordova') {
                if (window.IonicCordova) {
                    return Promise.resolve(window.IonicCordova);
                }
                else {
                    return Promise.reject('cordova-plugin-ionic not found');
                }
            }
            else {
                console.warn('cordova-plugin-ionic not available outside of the cordova platform.');
                return Promise.resolve(undefined);
            }
        });
    };
    /**
     * Wait for the underlying platform to be "ready."
     *
     * This is primarily important for Cordova, but there's
     * a web fallback. The promise will return which system
     * (either "cordova" or "web") it detected.
     *
     * Can be called repeatedly even if the platform is already ready.
     *
     * @return a promise that resolves once the platform is ready, or if already ready
     */
    Pro.prototype.platformReady = function () {
        if (this.platformReadyInfo && this.platformReadyInfo.ready === true) {
            return Promise.resolve(this.platformReadyInfo);
        }
        return this.platformReadyPromise;
    };
    /**
     * @return the current snapshot ID of the app running through Ionic Pro Deploy.
     */
    Pro.prototype.getSnapshotId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentVersion;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!window.IonicCordova) {
                            return [2 /*return*/, ''];
                        }
                        return [4 /*yield*/, this.deploy.getCurrentVersion()];
                    case 1:
                        currentVersion = _a.sent();
                        if (currentVersion) {
                            return [2 /*return*/, currentVersion.versionId];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @return the current channel of the app running through Ionic Pro Deploy.
     */
    Pro.prototype.getChannel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!window.IonicCordova) {
                            return [2 /*return*/, ''];
                        }
                        return [4 /*yield*/, this.deploy.getConfiguration()];
                    case 1:
                        config = _a.sent();
                        return [2 /*return*/, config.channel];
                }
            });
        });
    };
    /**
     * Create a local UUID for anonymous tracking
     */
    Pro.prototype.createUid = function () {
        if (!window.localStorage) {
            return 'FAKE_ID';
        }
        var uid = window.localStorage.getItem('_iouid');
        if (!uid) {
            uid = uuidv4();
            window.localStorage.setItem('_iouid', uid);
        }
        return uid;
    };
    /**
     * Wait for some kind of platform ready event.
     */
    Pro.prototype.watchPlatformReady = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (window.cordova) {
                document.addEventListener('deviceready', function () {
                    _this.platformReadyInfo = {
                        ready: true,
                        system: 'cordova'
                    };
                    resolve(_this.platformReadyInfo);
                });
            }
            else {
                window.addEventListener('load', function () {
                    _this.platformReadyInfo = {
                        ready: true,
                        system: 'web'
                    };
                });
            }
        });
    };
    return Pro;
}());
window.Pro = Pro;

exports.Pro = Pro;

Object.defineProperty(exports, '__esModule', { value: true });

})));
