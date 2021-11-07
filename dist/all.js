define("build-header", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildHeader = void 0;
    function buildHeader(options) {
        var _a = buildDom(options), headerElement = _a.headerElement, showLinkElement = _a.showLinkElement, inputElement = _a.inputElement;
        options.container.appendChild(headerElement);
        return {
            setSelectedCount: function (selectedCount) {
                if (selectedCount) {
                    headerElement.classList.add("selected");
                }
                else {
                    headerElement.classList.remove("selected");
                }
                showLinkElement.innerText = "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0412\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0435 (" + selectedCount + ")";
            },
            setValue: function (value) {
                inputElement.innerText = value;
            },
        };
    }
    exports.buildHeader = buildHeader;
    function buildDom(options) {
        var headerElement = document.createElement("div");
        headerElement.classList.add("header");
        var headlineElement = document.createElement("div");
        headlineElement.classList.add("header-headline");
        var captionElement = document.createElement("div");
        captionElement.classList.add("caption");
        captionElement.innerText = options.caption;
        var showLinkElement = document.createElement("div");
        showLinkElement.classList.add("header-show-link");
        showLinkElement.addEventListener("click", function () { return options.onShow(); });
        var inputElement = document.createElement("div");
        inputElement.classList.add("input");
        inputElement.addEventListener("click", function () { return options.onShow(); });
        headlineElement.appendChild(captionElement);
        headlineElement.appendChild(showLinkElement);
        headerElement.appendChild(headlineElement);
        headerElement.appendChild(inputElement);
        return { headerElement: headerElement, showLinkElement: showLinkElement, inputElement: inputElement };
    }
});
define("tree-helpers", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildChildren = exports.buildParents = void 0;
    function buildParents(items) {
        var stack = [];
        var parents = {};
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var value = item.value, level = item.level;
            if (stack.length >= level) {
                stack.length = level - 1;
            }
            if (stack.length === 0) {
                parents[value] = null;
            }
            else {
                parents[value] = stack[stack.length - 1];
            }
            stack.push(value);
        }
        return parents;
    }
    exports.buildParents = buildParents;
    function buildChildren(parents) {
        var children = {};
        for (var _i = 0, _a = Object.keys(parents); _i < _a.length; _i++) {
            var key = _a[_i];
            children[key] = [];
        }
        for (var _b = 0, _c = Object.keys(parents); _b < _c.length; _b++) {
            var key = _c[_b];
            var parent_1 = parents[key];
            if (parent_1 !== null) {
                children[parent_1].push(key);
            }
        }
        return children;
    }
    exports.buildChildren = buildChildren;
});
define("build-menu", ["require", "exports", "tree-helpers"], function (require, exports, tree_helpers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MenuComponent = void 0;
    var MenuComponent = /** @class */ (function () {
        function MenuComponent(options) {
            var _this = this;
            this.elements = {};
            this.values = [];
            this.tempValues = [];
            var menuElement = buildMenuDom();
            findChild(menuElement, ".menu-header .caption").innerText = options.caption;
            findChild(menuElement, ".menu-back-button").addEventListener("click", function () {
                return _this.onBackClick();
            });
            findChild(menuElement, ".menu-apply-button").addEventListener("click", function () {
                return _this.onApplyClick();
            });
            findChild(menuElement, ".menu-clear-button").addEventListener("click", function () {
                return _this.onClearClick();
            });
            findChild(menuElement, ".menu-filter .input").addEventListener("input", function (e) { return _this.onFilterInput(e.target.value); });
            this.onBack = options.onBack;
            this.onStateChange = options.onStateChange;
            options.container.appendChild(menuElement);
            this.children = (0, tree_helpers_1.buildChildren)((0, tree_helpers_1.buildParents)(options.items));
            var itemContainerElement = findChild(menuElement, ".menu-items");
            var _loop_1 = function (item) {
                var value = item.value, label = item.label, level = item.level;
                var itemElement = buildItemDom();
                findChild(itemElement, ".menu-item-arrow").style.marginLeft = level * 20 + "px";
                findChild(itemElement, ".menu-item-label").innerText = label;
                findChild(itemElement, ".menu-item-checkbox").addEventListener("click", function () { return _this.onCheckboxClick(value); });
                findChild(itemElement, ".menu-item-arrow").addEventListener("click", function () {
                    return _this.onArrowClick(value);
                });
                if (this_1.children[value].length === 0) {
                    itemElement.classList.add("nochild");
                }
                this_1.elements[value] = itemElement;
                itemContainerElement.appendChild(itemElement);
            };
            var this_1 = this;
            for (var _i = 0, _a = options.items; _i < _a.length; _i++) {
                var item = _a[_i];
                _loop_1(item);
            }
        }
        MenuComponent.prototype.setState = function (values) {
            this.values = values;
            this.tempValues = values;
            this.displayValues();
        };
        MenuComponent.prototype.onArrowClick = function (value) {
            var element = this.elements[value];
            var isHidden = !element.classList.contains("closed");
            if (isHidden) {
                element.classList.add("closed");
            }
            else {
                element.classList.remove("closed");
            }
            this.toggleItems(this.children[value], isHidden);
        };
        MenuComponent.prototype.onCheckboxClick = function (value) {
            var isSelected = this.tempValues.some(function (x) { return x === value; });
            if (isSelected) {
                this.tempValues = this.tempValues.filter(function (x) { return x !== value; });
            }
            else {
                this.tempValues.push(value);
            }
            this.displayValues();
        };
        MenuComponent.prototype.onFilterInput = function (value) {
            for (var _i = 0, _a = Object.values(this.elements); _i < _a.length; _i++) {
                var itemDom = _a[_i];
                var label = itemDom.innerText;
                if (label.includes(value)) {
                    itemDom.classList.remove("filtered");
                }
                else {
                    itemDom.classList.add("filtered");
                }
            }
        };
        MenuComponent.prototype.onApplyClick = function () {
            this.values = this.tempValues;
            this.onStateChange(this.values);
        };
        MenuComponent.prototype.onClearClick = function () {
            this.tempValues = [];
            this.displayValues();
        };
        MenuComponent.prototype.onBackClick = function () {
            this.tempValues = this.values;
            this.displayValues();
            this.onBack();
        };
        MenuComponent.prototype.displayValues = function () {
            for (var _i = 0, _a = Object.values(this.elements); _i < _a.length; _i++) {
                var element = _a[_i];
                element.classList.remove("selected");
            }
            for (var _b = 0, _c = this.tempValues; _b < _c.length; _b++) {
                var value = _c[_b];
                var element = this.elements[value];
                element.classList.add("selected");
            }
        };
        MenuComponent.prototype.toggleItems = function (values, isHidden) {
            for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                var value = values_1[_i];
                var element = this.elements[value];
                var isClosed = element.classList.contains("closed");
                if (isHidden) {
                    element.classList.add("hidden");
                }
                else {
                    element.classList.remove("hidden");
                }
                this.toggleItems(this.children[value], isHidden || isClosed);
            }
        };
        return MenuComponent;
    }());
    exports.MenuComponent = MenuComponent;
    function buildItemDom() {
        var dom = "\n  <div class=\"menu-item\">\n    <div class=\"menu-item-checkbox\"></div>\n    <div class=\"menu-item-arrow\"></div>\n    <div class=\"menu-item-label\"></div>\n  </div>\n  ";
        var document = new DOMParser().parseFromString(dom, "text/html");
        return findChild(document, "body > *");
    }
    function buildMenuDom() {
        var dom = "\n  <div class=\"menu\">\n    <div class=\"menu-header\">\n        <div class=\"menu-back-button\"></div>\n        <div class=\"caption\"></div>\n    </div>\n    <div class=\"menu-filter\">\n        <input class=\"input\" />\n    </div>\n    <div class=\"menu-items\">\n    </div>\n    <div class=\"menu-footer\">\n        <div class=\"menu-apply-button\">\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C</div>\n        <div class=\"menu-clear-button\">\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C</div>\n    </div>\n  </div>\n  ";
        var document = new DOMParser().parseFromString(dom, "text/html");
        return findChild(document, "body > *");
    }
    function findChild(element, selector) {
        return element.querySelector(selector);
    }
});
define("build-select", ["require", "exports", "build-header", "build-menu"], function (require, exports, build_header_1, build_menu_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildSelect = void 0;
    var SelectPlaceholder = "Кликните для выбора";
    function buildSelect(selectElement) {
        var _a;
        selectElement.style.display = "none";
        var title = ((_a = selectElement.attributes.getNamedItem("data-title")) === null || _a === void 0 ? void 0 : _a.value) || "";
        var data = extractOptions(selectElement);
        var treeContainer = buildContainer(selectElement);
        var headerContainer = buildContainer(selectElement);
        treeContainer.classList.add("hidden");
        var header = (0, build_header_1.buildHeader)({
            container: headerContainer,
            caption: title,
            onShow: function () { return treeContainer
                .requestFullscreen()
                .then(function () { return treeContainer.classList.remove("hidden"); }); },
        });
        treeContainer.addEventListener("fullscreenchange", function () {
            if (!document.fullscreenElement) {
                treeContainer.classList.add("hidden");
            }
        });
        var menu = new build_menu_1.MenuComponent({
            container: treeContainer,
            items: data,
            caption: title,
            onStateChange: function (values) {
                var _loop_2 = function (item) {
                    if (values.some(function (x) { return x === item.value; })) {
                        item.dom.setAttribute("selected", "selected");
                    }
                    else {
                        item.dom.removeAttribute("selected");
                    }
                };
                for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                    var item = data_1[_i];
                    _loop_2(item);
                }
                updateHeader(header, data);
            },
            onBack: function () { return document.exitFullscreen(); },
        });
        updateHeader(header, data);
        menu.setState(getSelectedValues(data));
    }
    exports.buildSelect = buildSelect;
    function getSelectedValues(data) {
        var result = [];
        for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
            var item = data_2[_i];
            if (item.dom.attributes.getNamedItem("selected")) {
                result.push(item.value);
            }
        }
        return result;
    }
    function updateHeader(header, data) {
        var selectedTitles = [];
        for (var _i = 0, data_3 = data; _i < data_3.length; _i++) {
            var item = data_3[_i];
            if (item.dom.attributes.getNamedItem("selected")) {
                selectedTitles.push(item.label);
            }
        }
        header.setSelectedCount(selectedTitles.length);
        if (selectedTitles.length) {
            header.setValue(selectedTitles.join(", "));
        }
        else {
            header.setValue(SelectPlaceholder);
        }
    }
    function extractOptions(selectElement) {
        var optionElements = selectElement.querySelectorAll("option");
        var result = [];
        for (var _i = 0, _a = Array.from(optionElements); _i < _a.length; _i++) {
            var item = _a[_i];
            var levelAttribute = item.attributes.getNamedItem("data-level");
            var valueAttribute = item.attributes.getNamedItem("value");
            if (!valueAttribute) {
                continue;
            }
            result.push({
                value: valueAttribute.value,
                level: levelAttribute ? Number(levelAttribute.value) : 1,
                label: item.innerText,
                dom: item,
            });
        }
        return result;
    }
    function buildContainer(selectElement) {
        function insertAfter(referenceNode, newNode) {
            var _a;
            (_a = referenceNode.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(newNode, referenceNode.nextSibling);
        }
        var mainDiv = document.createElement("div");
        insertAfter(selectElement, mainDiv);
        return mainDiv;
    }
});
