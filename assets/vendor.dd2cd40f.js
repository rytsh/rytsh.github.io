function e(){}function t(e){return e()}function n(){return Object.create(null)}function r(e){e.forEach(t)}function o(e){return"function"==typeof e}function i(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function a(e,t,n,r){if(e){const o=s(e,t,n,r);return e[0](o)}}function s(e,t,n,r){return e[1]&&r?function(e,t){for(const n in t)e[n]=t[n];return e}(n.ctx.slice(),e[1](r(t))):n.ctx}function u(e,t,n,r,o,i,a){const u=function(e,t,n,r){if(e[2]&&r){const o=e[2](r(n));if(void 0===t.dirty)return o;if("object"==typeof o){const e=[],n=Math.max(t.dirty.length,o.length);for(let r=0;r<n;r+=1)e[r]=t.dirty[r]|o[r];return e}return t.dirty|o}return t.dirty}(t,r,o,i);if(u){const o=s(t,n,r,a);e.p(o,u)}}function c(e){return null==e?"":e}function l(e,t){e.appendChild(t)}function f(e,t,n){e.insertBefore(t,n||null)}function p(e){e.parentNode.removeChild(e)}function d(e){return document.createElement(e)}function h(e){return document.createElementNS("http://www.w3.org/2000/svg",e)}function v(e){return document.createTextNode(e)}function m(){return v(" ")}function y(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function g(e){return Array.from(e.childNodes)}function b(e,t,n,r){for(let o=0;o<e.length;o+=1){const r=e[o];if(r.nodeName===t){let t=0;const i=[];for(;t<r.attributes.length;){const e=r.attributes[t++];n[e.name]||i.push(e.name)}for(let e=0;e<i.length;e++)r.removeAttribute(i[e]);return e.splice(o,1)[0]}}return r?h(t):d(t)}function w(e,t){for(let n=0;n<e.length;n+=1){const r=e[n];if(3===r.nodeType)return r.data=""+t,e.splice(n,1)[0]}return v(t)}function E(e){return w(e," ")}let T;function _(e){T=e}function A(e){(function(){if(!T)throw new Error("Function called outside component initialization");return T})().$$.on_mount.push(e)}const S=[],N=[],O=[],C=[],x=Promise.resolve();let L=!1;function $(e){O.push(e)}let M=!1;const k=new Set;function j(){if(!M){M=!0;do{for(let e=0;e<S.length;e+=1){const t=S[e];_(t),P(t.$$)}for(_(null),S.length=0;N.length;)N.pop()();for(let e=0;e<O.length;e+=1){const t=O[e];k.has(t)||(k.add(t),t())}O.length=0}while(S.length);for(;C.length;)C.pop()();L=!1,M=!1,k.clear()}}function P(e){if(null!==e.fragment){e.update(),r(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach($)}}const D=new Set;function R(e,t){e&&e.i&&(D.delete(e),e.i(t))}function Q(e,t,n,r){if(e&&e.o){if(D.has(e))return;D.add(e),undefined.c.push((()=>{D.delete(e),r&&(n&&e.d(1),r())})),e.o(t)}}function F(e){e&&e.c()}function H(e,t){e&&e.l(t)}function I(e,n,i,a){const{fragment:s,on_mount:u,on_destroy:c,after_update:l}=e.$$;s&&s.m(n,i),a||$((()=>{const n=u.map(t).filter(o);c?c.push(...n):r(n),e.$$.on_mount=[]})),l.forEach($)}function U(e,t){const n=e.$$;null!==n.fragment&&(r(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function q(e,t){-1===e.$$.dirty[0]&&(S.push(e),L||(L=!0,x.then(j)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function G(t,o,i,a,s,u,c=[-1]){const l=T;_(t);const f=t.$$={fragment:null,ctx:null,props:u,update:e,not_equal:s,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(l?l.$$.context:o.context||[]),callbacks:n(),dirty:c,skip_bound:!1};let d=!1;if(f.ctx=i?i(t,o.props||{},((e,n,...r)=>{const o=r.length?r[0]:n;return f.ctx&&s(f.ctx[e],f.ctx[e]=o)&&(!f.skip_bound&&f.bound[e]&&f.bound[e](o),d&&q(t,e)),n})):[],f.update(),d=!0,r(f.before_update),f.fragment=!!a&&a(f.ctx),o.target){if(o.hydrate){const e=g(o.target);f.fragment&&f.fragment.l(e),e.forEach(p)}else f.fragment&&f.fragment.c();o.intro&&R(t.$$.fragment),I(t,o.target,o.anchor,o.customElement),j()}_(l)}class Y{$destroy(){U(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;function z(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var V={exports:{}};"undefined"!=typeof self&&self;var W=z(V.exports=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=3)}([,function(e,t,n){(function(t){for(var r=n(11),o="undefined"==typeof window?t:window,i=["moz","webkit"],a="AnimationFrame",s=o["request"+a],u=o["cancel"+a]||o["cancelRequest"+a],c=0;!s&&c<i.length;c++)s=o[i[c]+"Request"+a],u=o[i[c]+"Cancel"+a]||o[i[c]+"CancelRequest"+a];if(!s||!u){var l=0,f=0,p=[];s=function(e){if(0===p.length){var t=r(),n=Math.max(0,1e3/60-(t-l));l=n+t,setTimeout((function(){var e=p.slice(0);p.length=0;for(var t=0;t<e.length;t++)if(!e[t].cancelled)try{e[t].callback(l)}catch(n){setTimeout((function(){throw n}),0)}}),Math.round(n))}return p.push({handle:++f,callback:e,cancelled:!1}),f},u=function(e){for(var t=0;t<p.length;t++)p[t].handle===e&&(p[t].cancelled=!0)}}e.exports=function(e){return s.call(o,e)},e.exports.cancel=function(){u.apply(o,arguments)},e.exports.polyfill=function(e){e||(e=o),e.requestAnimationFrame=s,e.cancelAnimationFrame=u}}).call(this,n(4))},,function(e,t,n){n.r(t),n.d(t,"default",(function(){return C}));var r=n(1),o=n.n(r),i=function(e){return new RegExp(/<[a-z][\s\S]*>/i).test(e)},a=function(e){var t=document.createElement("div");return t.innerHTML=e,t.childNodes},s=function(e,t){return Math.floor(Math.random()*(t-e+1))+e},u=function(e){var t=document.createElement("style");t.appendChild(document.createTextNode(e)),document.head.appendChild(t)},c="TYPE_CHARACTER",l="REMOVE_CHARACTER",f="REMOVE_ALL",p="REMOVE_LAST_VISIBLE_NODE",d="PAUSE_FOR",h="CALL_FUNCTION",v="ADD_HTML_TAG_ELEMENT",m="CHANGE_DELETE_SPEED",y="CHANGE_DELAY",g="CHANGE_CURSOR",b="PASTE_STRING",w="HTML_TAG",E="TEXT_NODE";function T(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function _(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?T(Object(n),!0).forEach((function(t){O(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):T(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function A(e){return function(e){if(Array.isArray(e))return S(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||function(e,t){if(e){if("string"==typeof e)return S(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?S(e,t):void 0}}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function S(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function N(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function O(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var C=function(){function e(t,n){var u=this;if(function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),O(this,"state",{cursorAnimation:null,lastFrameTime:null,pauseUntil:null,eventQueue:[],eventLoop:null,eventLoopPaused:!1,reverseCalledEvents:[],calledEvents:[],visibleNodes:[],initialOptions:null,elements:{container:null,wrapper:document.createElement("span"),cursor:document.createElement("span")}}),O(this,"options",{strings:null,cursor:"|",delay:"natural",pauseFor:1500,deleteSpeed:"natural",loop:!1,autoStart:!1,devMode:!1,skipAddStyles:!1,wrapperClassName:"Typewriter__wrapper",cursorClassName:"Typewriter__cursor",stringSplitter:null,onCreateTextNode:null,onRemoveNode:null}),O(this,"setupWrapperElement",(function(){u.state.elements.container&&(u.state.elements.wrapper.className=u.options.wrapperClassName,u.state.elements.cursor.className=u.options.cursorClassName,u.state.elements.cursor.innerHTML=u.options.cursor,u.state.elements.container.innerHTML="",u.state.elements.container.appendChild(u.state.elements.wrapper),u.state.elements.container.appendChild(u.state.elements.cursor))})),O(this,"start",(function(){return u.state.eventLoopPaused=!1,u.runEventLoop(),u})),O(this,"pause",(function(){return u.state.eventLoopPaused=!0,u})),O(this,"stop",(function(){return u.state.eventLoop&&(Object(r.cancel)(u.state.eventLoop),u.state.eventLoop=null),u})),O(this,"pauseFor",(function(e){return u.addEventToQueue(d,{ms:e}),u})),O(this,"typeOutAllStrings",(function(){return"string"==typeof u.options.strings?(u.typeString(u.options.strings).pauseFor(u.options.pauseFor),u):(u.options.strings.forEach((function(e){u.typeString(e).pauseFor(u.options.pauseFor).deleteAll(u.options.deleteSpeed)})),u)})),O(this,"typeString",(function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(i(e))return u.typeOutHTMLString(e,t);if(e){var n=(u.options||{}).stringSplitter,r="function"==typeof n?n(e):e.split("");u.typeCharacters(r,t)}return u})),O(this,"pasteString",(function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return i(e)?u.typeOutHTMLString(e,t,!0):(e&&u.addEventToQueue(b,{character:e,node:t}),u)})),O(this,"typeOutHTMLString",(function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=arguments.length>2?arguments[2]:void 0,r=a(e);if(r.length>0)for(var o=0;o<r.length;o++){var i=r[o],s=i.innerHTML;i&&3!==i.nodeType?(i.innerHTML="",u.addEventToQueue(v,{node:i,parentNode:t}),n?u.pasteString(s,i):u.typeString(s,i)):i.textContent&&(n?u.pasteString(i.textContent,t):u.typeString(i.textContent,t))}return u})),O(this,"deleteAll",(function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"natural";return u.addEventToQueue(f,{speed:e}),u})),O(this,"changeDeleteSpeed",(function(e){if(!e)throw new Error("Must provide new delete speed");return u.addEventToQueue(m,{speed:e}),u})),O(this,"changeDelay",(function(e){if(!e)throw new Error("Must provide new delay");return u.addEventToQueue(y,{delay:e}),u})),O(this,"changeCursor",(function(e){if(!e)throw new Error("Must provide new cursor");return u.addEventToQueue(g,{cursor:e}),u})),O(this,"deleteChars",(function(e){if(!e)throw new Error("Must provide amount of characters to delete");for(var t=0;t<e;t++)u.addEventToQueue(l);return u})),O(this,"callFunction",(function(e,t){if(!e||"function"!=typeof e)throw new Error("Callbak must be a function");return u.addEventToQueue(h,{cb:e,thisArg:t}),u})),O(this,"typeCharacters",(function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(!e||!Array.isArray(e))throw new Error("Characters must be an array");return e.forEach((function(e){u.addEventToQueue(c,{character:e,node:t})})),u})),O(this,"removeCharacters",(function(e){if(!e||!Array.isArray(e))throw new Error("Characters must be an array");return e.forEach((function(){u.addEventToQueue(l)})),u})),O(this,"addEventToQueue",(function(e,t){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];return u.addEventToStateProperty(e,t,n,"eventQueue")})),O(this,"addReverseCalledEvent",(function(e,t){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];return u.options.loop?u.addEventToStateProperty(e,t,n,"reverseCalledEvents"):u})),O(this,"addEventToStateProperty",(function(e,t){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],r=arguments.length>3?arguments[3]:void 0,o={eventName:e,eventArgs:t||{}};return u.state[r]=n?[o].concat(A(u.state[r])):[].concat(A(u.state[r]),[o]),u})),O(this,"runEventLoop",(function(){u.state.lastFrameTime||(u.state.lastFrameTime=Date.now());var e=Date.now(),t=e-u.state.lastFrameTime;if(!u.state.eventQueue.length){if(!u.options.loop)return;u.state.eventQueue=A(u.state.calledEvents),u.state.calledEvents=[],u.options=_({},u.state.initialOptions)}if(u.state.eventLoop=o()(u.runEventLoop),!u.state.eventLoopPaused){if(u.state.pauseUntil){if(e<u.state.pauseUntil)return;u.state.pauseUntil=null}var n=A(u.state.eventQueue),r=n.shift(),i=0;if(!(t<=(i=r.eventName===p||r.eventName===l?"natural"===u.options.deleteSpeed?s(40,80):u.options.deleteSpeed:"natural"===u.options.delay?s(120,160):u.options.delay))){var a=r.eventName,T=r.eventArgs;switch(u.logInDevMode({currentEvent:r,state:u.state,delay:i}),a){case b:case c:var S=T.character,N=T.node,O=document.createTextNode(S),C=O;u.options.onCreateTextNode&&"function"==typeof u.options.onCreateTextNode&&(C=u.options.onCreateTextNode(S,O)),C&&(N?N.appendChild(C):u.state.elements.wrapper.appendChild(C)),u.state.visibleNodes=[].concat(A(u.state.visibleNodes),[{type:E,character:S,node:C}]);break;case l:n.unshift({eventName:p,eventArgs:{removingCharacterNode:!0}});break;case d:var x=r.eventArgs.ms;u.state.pauseUntil=Date.now()+parseInt(x);break;case h:var L=r.eventArgs,$=L.cb,M=L.thisArg;$.call(M,{elements:u.state.elements});break;case v:var k=r.eventArgs,j=k.node,P=k.parentNode;P?P.appendChild(j):u.state.elements.wrapper.appendChild(j),u.state.visibleNodes=[].concat(A(u.state.visibleNodes),[{type:w,node:j,parentNode:P||u.state.elements.wrapper}]);break;case f:var D=u.state.visibleNodes,R=T.speed,Q=[];R&&Q.push({eventName:m,eventArgs:{speed:R,temp:!0}});for(var F=0,H=D.length;F<H;F++)Q.push({eventName:p,eventArgs:{removingCharacterNode:!1}});R&&Q.push({eventName:m,eventArgs:{speed:u.options.deleteSpeed,temp:!0}}),n.unshift.apply(n,Q);break;case p:var I=r.eventArgs.removingCharacterNode;if(u.state.visibleNodes.length){var U=u.state.visibleNodes.pop(),q=U.type,G=U.node,Y=U.character;u.options.onRemoveNode&&"function"==typeof u.options.onRemoveNode&&u.options.onRemoveNode({node:G,character:Y}),G&&G.parentNode.removeChild(G),q===w&&I&&n.unshift({eventName:p,eventArgs:{}})}break;case m:u.options.deleteSpeed=r.eventArgs.speed;break;case y:u.options.delay=r.eventArgs.delay;break;case g:u.options.cursor=r.eventArgs.cursor,u.state.elements.cursor.innerHTML=r.eventArgs.cursor}u.options.loop&&(r.eventName===p||r.eventArgs&&r.eventArgs.temp||(u.state.calledEvents=[].concat(A(u.state.calledEvents),[r]))),u.state.eventQueue=n,u.state.lastFrameTime=e}}})),t)if("string"==typeof t){var T=document.querySelector(t);if(!T)throw new Error("Could not find container element");this.state.elements.container=T}else this.state.elements.container=t;n&&(this.options=_(_({},this.options),n)),this.state.initialOptions=_({},this.options),this.init()}var t;return(t=[{key:"init",value:function(){this.setupWrapperElement(),this.addEventToQueue(g,{cursor:this.options.cursor},!0),this.addEventToQueue(f,null,!0),!window||window.___TYPEWRITER_JS_STYLES_ADDED___||this.options.skipAddStyles||(u(".Typewriter__cursor{-webkit-animation:Typewriter-cursor 1s infinite;animation:Typewriter-cursor 1s infinite;margin-left:1px}@-webkit-keyframes Typewriter-cursor{0%{opacity:0}50%{opacity:1}100%{opacity:0}}@keyframes Typewriter-cursor{0%{opacity:0}50%{opacity:1}100%{opacity:0}}"),window.___TYPEWRITER_JS_STYLES_ADDED___=!0),!0===this.options.autoStart&&this.options.strings&&this.typeOutAllStrings().start()}},{key:"logInDevMode",value:function(e){this.options.devMode&&console.log(e)}}])&&N(e.prototype,t),e}()},function(e,t){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(r){"object"==typeof window&&(n=window)}e.exports=n},,,,,,,function(e,t,n){(function(t){(function(){var n,r,o,i,a,s;"undefined"!=typeof performance&&null!==performance&&performance.now?e.exports=function(){return performance.now()}:null!=t&&t.hrtime?(e.exports=function(){return(n()-a)/1e6},r=t.hrtime,i=(n=function(){var e;return 1e9*(e=r())[0]+e[1]})(),s=1e9*t.uptime(),a=i-s):Date.now?(e.exports=function(){return Date.now()-o},o=Date.now()):(e.exports=function(){return(new Date).getTime()-o},o=(new Date).getTime())}).call(this)}).call(this,n(12))},function(e,t){var n,r,o=e.exports={};function i(){throw new Error("setTimeout has not been defined")}function a(){throw new Error("clearTimeout has not been defined")}function s(e){if(n===setTimeout)return setTimeout(e,0);if((n===i||!n)&&setTimeout)return n=setTimeout,setTimeout(e,0);try{return n(e,0)}catch(t){try{return n.call(null,e,0)}catch(r){return n.call(this,e,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:i}catch(e){n=i}try{r="function"==typeof clearTimeout?clearTimeout:a}catch(e){r=a}}();var u,c=[],l=!1,f=-1;function p(){l&&u&&(l=!1,u.length?c=u.concat(c):f=-1,c.length&&d())}function d(){if(!l){var e=s(p);l=!0;for(var t=c.length;t;){for(u=c,c=[];++f<t;)u&&u[f].run();f=-1,t=c.length}u=null,l=!1,function(e){if(r===clearTimeout)return clearTimeout(e);if((r===a||!r)&&clearTimeout)return r=clearTimeout,clearTimeout(e);try{r(e)}catch(t){try{return r.call(null,e)}catch(n){return r.call(this,e)}}}(e)}}function h(e,t){this.fun=e,this.array=t}function v(){}o.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];c.push(new h(e,t)),1!==c.length||l||s(d)},h.prototype.run=function(){this.fun.apply(null,this.array)},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=v,o.addListener=v,o.once=v,o.off=v,o.removeListener=v,o.removeAllListeners=v,o.emit=v,o.prependListener=v,o.prependOnceListener=v,o.listeners=function(e){return[]},o.binding=function(e){throw new Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(e){throw new Error("process.chdir is not supported")},o.umask=function(){return 0}}]).default);export{Y as S,W as T,h as a,g as b,b as c,p as d,y as e,f,l as g,e as h,G as i,d as j,m as k,F as l,E as m,c as n,H as o,w as p,I as q,R as r,i as s,v as t,Q as u,U as v,A as w,N as x,a as y,u as z};