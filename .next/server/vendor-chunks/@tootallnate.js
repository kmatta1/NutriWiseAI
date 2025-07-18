"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@tootallnate";
exports.ids = ["vendor-chunks/@tootallnate"];
exports.modules = {

/***/ "(action-browser)/./node_modules/@tootallnate/once/dist/index.js":
/*!******************************************************!*\
  !*** ./node_modules/@tootallnate/once/dist/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nfunction once(emitter, name, { signal } = {}) {\n    return new Promise((resolve, reject) => {\n        function cleanup() {\n            signal === null || signal === void 0 ? void 0 : signal.removeEventListener('abort', cleanup);\n            emitter.removeListener(name, onEvent);\n            emitter.removeListener('error', onError);\n        }\n        function onEvent(...args) {\n            cleanup();\n            resolve(args);\n        }\n        function onError(err) {\n            cleanup();\n            reject(err);\n        }\n        signal === null || signal === void 0 ? void 0 : signal.addEventListener('abort', cleanup);\n        emitter.on(name, onEvent);\n        emitter.on('error', onError);\n    });\n}\nexports[\"default\"] = once;\n//# sourceMappingURL=index.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFjdGlvbi1icm93c2VyKS8uL25vZGVfbW9kdWxlcy9AdG9vdGFsbG5hdGUvb25jZS9kaXN0L2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFhO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELCtCQUErQixTQUFTLElBQUk7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLGtCQUFlO0FBQ2YiLCJzb3VyY2VzIjpbIkM6XFxyZXBvXFxOdXRyaVdpc2VBSVxcbm9kZV9tb2R1bGVzXFxAdG9vdGFsbG5hdGVcXG9uY2VcXGRpc3RcXGluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gb25jZShlbWl0dGVyLCBuYW1lLCB7IHNpZ25hbCB9ID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBmdW5jdGlvbiBjbGVhbnVwKCkge1xuICAgICAgICAgICAgc2lnbmFsID09PSBudWxsIHx8IHNpZ25hbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgY2xlYW51cCk7XG4gICAgICAgICAgICBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKG5hbWUsIG9uRXZlbnQpO1xuICAgICAgICAgICAgZW1pdHRlci5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBvbkV2ZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgIHJlc29sdmUoYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gb25FcnJvcihlcnIpIHtcbiAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9XG4gICAgICAgIHNpZ25hbCA9PT0gbnVsbCB8fCBzaWduYWwgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIGNsZWFudXApO1xuICAgICAgICBlbWl0dGVyLm9uKG5hbWUsIG9uRXZlbnQpO1xuICAgICAgICBlbWl0dGVyLm9uKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgIH0pO1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gb25jZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(action-browser)/./node_modules/@tootallnate/once/dist/index.js\n");

/***/ })

};
;