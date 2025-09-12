/**
 * YoktoJS - A micro DOM utility/minimal DOM/HTTP helper library + DOM updater
 * --------------------------------------------
 * Provides ultra lightweight utilities for DOM selection, manipulation, element creation, traversal
 * DOM ready callbacks, and AJAX (fetch).
 *   - DOM selection: $
 *   - Helpers: __
 *   - Element creation: _
 *   - DOM ready: $$
 *   - DOM updater: $_
 *   - HTTP Clients: RESTClient, GraphQLClient
 *   - WebSocket Client: WSClient
 *   - Inline style helper: $c
 *
 * API:
 *   $(selector, return_list) -> Selects elements
 *     - returns single element if only one match or return_list == false
 *     - returns array of elements if multiple matches and return_list == true
 *
 *   __(obj) -> Checks if obj is an array-like object (helper)
 *
 *   _(parentSelector, tag, attrs, innerText) -> Creates and appends element
 *
 *   $$(fn) -> Executes fn when DOM is ready
 *
 *   $_(method, url, data) -> Fetch wrapper for JSON APIs
 *
 *   $_(query, options|string|array) -> Universal DOM updater
 *     - addClasses: string|array
 *     - removeClasses: string|array
 *     - toggleClasses: string|array
 *     - setAttrs: { key: value }
 *     - removeAttrs: string|array
 *     - index: number (optional, target only one element)
 *     - If `options` is a string or array, defaults to addClasses
 *
 *   RESTClient() -> HTTP REST Client
 *     - ...
 *     - ...: ..|..
 *     - ...
 *
 *   GraphQLClient() -> GraphQ Client
 *     - ...: ...
 *     - ...: ...|...
 *     - ...
 *
 *   WSClient() -> WebSocket Client
 *     - ...: ...
 *     - ...: ...|...
 *     - ...
 */


/**
 * Select elements from DOM.
 * @param {string} query - CSS selector string
 * @param {boolean} [return_list=false] - if true, return all matching elements as array
 * @returns {Element|Element[]} - a single Element or array of Elements
 */
const $ = (query, return_list) => {
    const elems = document.querySelectorAll(query);
    if (elems.length === 1 || !return_list) {
        return elems[0];
    }
    return Array.prototype.slice.call(elems);
};


/**
 * Check if object is array-like.
 * @param {any} obj
 * @returns {boolean} true if object is array-like
 */
const __ = (obj) => {
    if (typeof obj === "object" && obj.length) {
        return true;
    }
};


/**
 * Create and append a new element inside parent element.
 * @param {string} parentSelector - CSS selector of parent
 * @param {string} tag - tag name of element to create
 * @param {object} [attrs] - attributes as key:value
 * @param {string} [innerText] - optional inner text content
 */
const _ = (parentSelector, tag, attrs, innerText) => {
    var parentElem = $(parentSelector);
    let elem = document.createElement(tag);
    if (!(__(typeof attrs))) {
        for (key in attrs) {
            elem.setAttribute(key, attrs[key]);
        }
    }
    if (innerText) {
        elem.innerText = innerText.toString();
    }
    parentElem.appendChild(elem);
};


/**
 * Run a function when DOM is ready.
 * @param {Function} fn - function to execute
 */
const $$ = (fn) => {
    if (typeof fn !== "function") {
        throw new Error("Argument passed to ready should be a function.");
    }

    if (document.readyState != "loading") {
        fn();
    } else if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
        document.attachEvent("onreadystatechange", function () {
            if (document.readyState != "loading") fn();
        });
    }
};


/**
 * Universal DOM element updater
 * @param {string} query - CSS selector
 * @param {object} options - {
 *   addClasses: string|array,
 *   removeClasses: string|array,
 *   toggleClasses: string|array,
 *   setAttrs: { key: value },
 *   removeAttrs: string|array,
 *   index?: number
 * }
 */
const $_ = (query, options = {}) => {
    // Shortcut: if string/array passed, assume addClasses
    if (typeof options === "string" || Array.isArray(options)) {
        options = { addClasses: options };
    }

    let nodes = $(query, true);
    if (!nodes) return;

    if (!Array.isArray(nodes)) nodes = [nodes];
    if (typeof options.index === "number") {
        nodes = [nodes[options.index]].filter(Boolean);
    }

    nodes.forEach(el => {
        // Add classes
        if (options.addClasses) {
            const clsArr = Array.isArray(options.addClasses)
                ? options.addClasses
                : String(options.addClasses).split(/\s+/).filter(Boolean);
            el.classList.add(...clsArr);
        }

        // Remove classes
        if (options.removeClasses) {
            const clsArr = Array.isArray(options.removeClasses)
                ? options.removeClasses
                : String(options.removeClasses).split(/\s+/).filter(Boolean);
            el.classList.remove(...clsArr);
        }

        // Toggle classes
        if (options.toggleClasses) {
            const clsArr = Array.isArray(options.toggleClasses)
                ? options.toggleClasses
                : String(options.toggleClasses).split(/\s+/).filter(Boolean);
            clsArr.forEach(cls => el.classList.toggle(cls));
        }

        // Set attributes
        if (options.setAttrs) {
            for (const [k, v] of Object.entries(options.setAttrs)) {
                el.setAttribute(k, v);
            }
        }

        // Remove attributes
        if (options.removeAttrs) {
            const attrArr = Array.isArray(options.removeAttrs)
                ? options.removeAttrs
                : [options.removeAttrs];
            attrArr.forEach(attr => el.removeAttribute(attr));
        }
    });
};

/**
 * Inline style setter
 * @param {string} query - CSS selector
 * @param {object|string} styles - object of {prop: value} OR string "prop: value"
 * @param {number} [index] - optional single element index
 */
const $s = (query, styles, index) => {
    let nodes = $(query, true);
    if (!nodes) return;

    if (!Array.isArray(nodes)) nodes = [nodes];
    if (typeof index === "number") {
        nodes = [nodes[index]].filter(Boolean);
    }

    nodes.forEach(el => {
        if (typeof styles === "string") {
            // parse "prop: value"
            let [prop, val] = styles.split(":").map(s => s.trim());
            if (prop && val) el.style[prop] = val;
        } else {
            // apply multiple styles
            for (const [prop, val] of Object.entries(styles)) {
                el.style[prop] = val;
            }
        }
    });
};


/**
 * REST API client
 * ------------------------
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} url - endpoint URL
 * @param {object} [options] - optional config
 * @param {object} [options.data] - JSON body for POST/PUT
 * @param {object} [options.params] - query parameters for GET
 * @param {object} [options.headers] - additional headers
 * @param {boolean} [options.raw=false] - return raw Response instead of JSON
 * @returns {Promise<object|Response>} - JSON response or raw Response
 */
const RESTClient = async (method, url, options = {}) => {
    const { data, params, headers, raw } = options;

    let fullUrl = url;
    if (params && typeof params === "object") {
        const queryString = new URLSearchParams(params).toString();
        fullUrl += (url.includes("?") ? "&" : "?") + queryString;
    }

    const fetchOptions = {
        method,
        headers: { ...(headers || {}) },
        body: data ? JSON.stringify(data) : undefined,
    };

    if (data && !fetchOptions.headers["Content-Type"]) {
        fetchOptions.headers["Content-Type"] = "application/json";
    }

    const resp = await fetch(fullUrl, fetchOptions);
    return raw ? resp : await resp.json();
};


/**
 * GraphQL client
 * --------------
 * @param {string} url - GraphQL endpoint
 * @param {object} options
 * @param {string} options.query - GraphQL query or mutation
 * @param {object} [options.variables] - variables for query
 * @param {object} [options.headers] - custom headers
 * @returns {Promise<object>} - parsed JSON response
 */
const GraphQLClient = async (url, options = {}) => {
    const { query, variables, headers } = options;
    if (!query) throw new Error("GraphQL query is required.");

    const resp = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(headers || {}),
        },
        body: JSON.stringify({ query, variables }),
    });

    return await resp.json();
};


/**
 * WebSocket wrapper
 * -----------------
 * @param {string} url - WebSocket server URL
 * @param {object} [options]
 * @param {function} [options.onOpen] - called on connection open
 * @param {function} [options.onClose] - called on connection close
 * @param {function} [options.onMessage] - called on incoming message
 * @param {function} [options.onError] - called on error
 * @returns {WebSocket} - WebSocket instance with sendMessage method
 */
const WSClient = (url, options = {}) => {
    const ws = new WebSocket(url);

    ws.onopen = event => options.onOpen?.(event);
    ws.onclose = event => options.onClose?.(event);
    ws.onmessage = event => options.onMessage?.(event);
    ws.onerror = event => options.onError?.(event);

    ws.sendMessage = (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(typeof data === "string" ? data : JSON.stringify(data));
        }
    };

    return ws;
};
