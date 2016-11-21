(function(namespace, $) {
	"use strict";

	var DemoPageTimeline = function() {
		// Create reference to this instance
		var o = this;
		// Initialize app when document is ready
		$(document).ready(function() {
			o.initialize();
		});

	};
	var p = DemoPageTimeline.prototype;

	// =========================================================================
	// MEMBERS
	// =========================================================================

	p.map = null;

	// =========================================================================
	// INIT
	// =========================================================================

	p.initialize = function() {
		this._initGMaps1();
		this._initGMaps2();
	};

	// =========================================================================
	// GMaps
	// =========================================================================

	p._initGMaps1 = function() {
		if (typeof GMaps === 'undefined') {
			return;
		}
		if ($('#map-canvas1').length === 0) {
			return;
		}

		this.map = new GMaps({
			div: '#map-canvas1',
			lat: 52.376950,
			lng: 4.898365,
			zoom: 11,
			disableDefaultUI: true
		});

		this.map.addMarker({
			lat: 52.37050,
			lng: 4.90454,
			title: 'Amsterdam',
			click: function(e) {
				alert('You clicked in this marker');
			}
		});
	};
	
	p._initGMaps2 = function() {
		if (typeof GMaps === 'undefined') {
			return;
		}
		if ($('#map-canvas2').length === 0) {
			return;
		}

		this.map = new GMaps({
			div: '#map-canvas2',
			lat: 52.376950,
			lng: 4.898365,
			zoom: 11,
			disableDefaultUI: true
		});

		this.map.addMarker({
			lat: 52.37050,
			lng: 4.90454,
			title: 'Amsterdam',
			click: function(e) {
				alert('You clicked in this marker');
			}
		});
	};

	// =========================================================================
	namespace.DemoPageTimeline = new DemoPageTimeline;
}(this.materialadmin, jQuery)); // pass in (namespace, jQuery):
