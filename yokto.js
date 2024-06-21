const $ = (query, return_list) => {
    const elems = document.querySelectorAll(query);
    if (elems.length === 1 || !return_list) {
        return elems[0];
    };
    return Array.prototype.slice.call(elems);
};
const __ = (obj) => {
    if (typeof(obj) === "object" && obj.length) {  // WARN: Will also return undefined when the Array is empty.
        return true;
    };
};
const _ = (parentSelector, tag, attrs, innerText) => {
    var parentElem = $(parentSelector);
    let elem = document.createElement(tag);
    if ( !(__(typeof(attrs))) ) {
        for (key in attrs) {
            elem.setAttribute(key, attrs[key]);
        };
    };
    if (innerText) {
        elem.innerText = innerText.toString();
    };
    parentElem.appendChild(elem);
};
const $$ = (callback) => {
    window.addEventListener("DOMContentLoaded", () => {
        callback();
    });
};
const $_ = async (method, url, data) => {
    var headers = {};
    if (data) {
        headers['Content-Type'] = 'application/json';
        headers['Accept'] = 'application/json';
    };
    const resp = await fetch(url, {
        method: method,
        mode: 'same-origin',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: headers,
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    });
    return await resp.json();
};
