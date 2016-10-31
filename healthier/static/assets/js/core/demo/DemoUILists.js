(function(namespace, $) {
	"use strict";

	var DemoUILists = function() {
		// Create reference to this instance
		var o = this;
		// Initialize app when document is ready
		$(document).ready(function() {
			o.initialize();
		});

	};
	var p = DemoUILists.prototype;
	
	// =========================================================================
	// INIT
	// =========================================================================

	p.initialize = function() {
		this._initNestableLists();
	};
	
	// =========================================================================
	// NESTABLE LISTS
	// =========================================================================

	p._initNestableLists = function() {
		if (!$.isFunction($.fn.nestable)) {
			return;
		}

		$('.nestable-list').nestable();
	};

	// =========================================================================
	namespace.DemoUILists = new DemoUILists;
}(this.materialadmin, jQuery)); // pass in (namespace, jQuery):
