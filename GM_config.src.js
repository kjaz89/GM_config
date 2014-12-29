// ==UserScript==
// @name        GM_config (eight's version)
// @description	A library to help you set up configure in greasemonkey script.
// @namespace   eight04.blogspot.com
// @include     http*
// @version     0.1.0
// @grant       GM_setValue
// @grant		GM_getValue
// @license		MIT
// ==/UserScript==

var GM_config = function(){

	"use strict";

	var config = {
		title: null,
		settings: null
	}, dialog, css;

	function element(tag, attr, children) {
		var e, key, i;

		e = document.createElement(tag);

		if (attr) {
			for (key in attr) {
				e.setAttribute(key, attr[key]);
			}
		}

		if (children) {
			if (!Array.isArray(children)) {
				children = [children];
			}
			for (i = 0; i < children.length; i++) {
				if (typeof children[i] == "string") {
					children[i] = document.createTextNode(children[i]);
				}
				e.appendChild(children[i]);
			}
		}

		return e;
	}

	function getValue(key, type) {
		var value;

		if (typeof GM_getValue != "undefined") {
			value = GM_getValue(key);
		} else {
			value = localStorage.getItem(key);
		}
		if (value == null) {
			return null;
		}
		switch(type) {
			case "number":
				return +value;
			case "checkbox":
				return value == "true";
			default:
				return value;
		}
	}

	function setValue(key, value) {
		if (typeof GM_setValue != "undefined") {
			GM_setValue(key, value);
		} else {
			localStorage.setItem(key, value.toString());
		}
	}

	function read() {
		var key, s;
		for (key in config.settings) {
			s = config.settings[key];
			s.value = getValue(key, s.type);
			if (s.value == null) {
				s.value = s.default;
			}
		}
	}

	function save() {
		var key, s;
		for (key in config.settings) {
			s = config.settings[key];
			if (s.value == null) {
				setValue(key, s.default);
			} else {
				setValue(key, s.value);
			}
		}
	}

	function createDialog(title) {
		var dialog;

		dialog = element("div", {"class": "config-dialog"}, [
			element("div", {"class": "config-dialog-content"}, [
				element("div", {"class": "config-dialog-head"}, title),
				element("div", {"class": "config-dialog-body"}),
				element("div", {"class": "config-dialog-footer"})
			])
		]);

		return {
			element: dialog,
			body: dialog.querySelector(".config-dialog-body"),
			footer: dialog.querySelector(".config-dialog-footer")
		};
	}

	function close(saveFlag) {
		var key, s;

		if (!dialog) {
			return;
		}
		dialog.element.parentNode.removeChild(dialog.element);
		dialog = null;

		for (key in config.settings) {
			s = config.settings[key];
			if (saveFlag) {
				switch (s.type) {
					case "number":
						s.value = +s.element.value;
						break;
					case "checkbox":
						s.value = s.element.checked;
						break;
					default:
						s.value = s.element.value;
				}
			}
			s.element = null;
		}

		if (saveFlag) {
			save();
		}

		if (GM_config.onclose) {
			GM_config.onclose(saveFlag);
		}
	}

	function open() {
		var key, s, btn, group;

		if (!css) {
			var cssString = "@@CSS";
			css = element("style", {"id": "config-css"}, cssString);
			document.head.appendChild(css);
		}

		if (!dialog) {
			dialog = createDialog(config.title);
			for (key in config.settings) {
				s = config.settings[key];

				s.element = element("input", {"id": key, "type": s.type});

				switch (s.type) {
					case "number":
						s.element.classList.add("form-control");
						s.element.value = s.value.toString();
						group = [
							element("label", {"for": key}, s.label),
							s.element
						];
						break;
					case "checkbox":
						s.element.checked = s.value;
						group = element("div", {"class": "checkbox"}, [
							s.element,
							element("label", {"for": key}, s.label)
						]);
						break;
					default:
						s.element.value = s.value;
						s.element.classList.add("form-control");
						group = [
							element("label", {"for": key}, s.label),
							s.element
						];
				}

				dialog.body.appendChild(
					element("div", {"class": "form-group"}, group)
				);
			}

			btn = element("button", {"class": "btn-default"}, "Save");
			btn.onclick = function() {
				close(true);
			};
			dialog.footer.appendChild(btn);

			btn = element("button", {"class": "btn-default"}, "Cancel");
			btn.onclick = function() {
				close();
			};
			dialog.footer.appendChild(btn);

			document.body.appendChild(dialog.element);
		}
	}

	GM_config = {
		init: function(title, settings) {
			config.title = title;
			config.settings = settings;
			read();
		},
		open: open,
		close: close,
		get: function(key) {
			var con;

			if (key) {
				return config.settings[key].value;
			} else {
				con = {};
				for (key in config.settings) {
					con[key] = config.settings[key].value;
				}
				return con;
			}
		}
	};

	return GM_config;
}();