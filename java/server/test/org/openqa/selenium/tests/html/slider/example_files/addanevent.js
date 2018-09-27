/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function addAnEvent(el, evname, func) {
    if (el.attachEvent) { // IE
        el.attachEvent("on" + evname, func);
    } else if (el.addEventListener) { // Gecko / W3C
        el.addEventListener(evname, func, true);
    } else {
        el["on" + evname] = func;
    }
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
