(function (namespace, $) {
	"use strict";

	var DemoLayout = function () {
		// Create reference to this instance
		var o = this;
		// Initialize app when document is ready
		$(document).ready(function () {
			o.initialize();
		});

	};
	var p = DemoLayout.prototype;

	// =========================================================================
	// INIT
	// =========================================================================

	p.initialize = function () {
		this._enableEvents();
	};

	// =========================================================================
	// EVENTS
	// =========================================================================

	// events
	p._enableEvents = function () {
		var o = this;

		$('.card-outlined').on('click', function (e) {
			var btn = $(e.currentTarget).next('.text-caption').find('a');
			o._changeLayout(btn);
		});
		$('.layoutButton').on('click', function (e) {
			var btn = $(e.currentTarget);
			o._changeLayout(btn);
		});
	};

	// =========================================================================
	// LAYOUT
	// =========================================================================

	p._changeLayout = function (btn) {
		var layout = btn.data('layout');
		var card = btn.parent().prev('.card');
		
		// Set correct card states
		$('.card.style-accent').removeClass('style-accent').addClass('style-default-bright');
		card.addClass('style-accent');
		
		// Set correct button states
		$('.layoutButton').removeClass('disabled').empty().append('Activate');
		btn.empty().append('Activated').addClass('disabled').blur();
		
		// Remove all layout classes
		$('body').removeClass('header-fixed');
		$('body').removeClass('menubar-first');
		$('body').removeClass('menubar-pin');
		$('#menubar').data('expanded', false);

		// Select appropriate layout classes
		switch (layout) {
			case 1:
				$('body').addClass('header-fixed');
				$('body').addClass('menubar-pin');
				$('#menubar').data('expanded', true);
				break;
			case 2:
				$('body').addClass('header-fixed');
				break;
			case 3:
				$('body').addClass('header-fixed');
				$('body').addClass('menubar-pin');
				$('body').addClass('menubar-first');
				$('#menubar').data('expanded', true);
				break;
			case 4:
				$('body').addClass('header-fixed');
				$('body').addClass('menubar-first');
				break;
			case 5:
				$('body').addClass('menubar-pin');
				$('body').addClass('menubar-first');
				$('#menubar').data('expanded', true);
				break;
			case 6:
				$('body').addClass('menubar-first');
				break;
		}
	};

	// =========================================================================
	namespace.DemoLayout = new DemoLayout;
}(this.materialadmin, jQuery)); // pass in (namespace, jQuery):
