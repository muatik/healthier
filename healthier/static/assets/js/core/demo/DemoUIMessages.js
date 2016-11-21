(function (namespace, $) {
	"use strict";

	var DemoUIMessages = function () {
		// Create reference to this instance
		var o = this;
		// Initialize app when document is ready
		$(document).ready(function () {
			o.initialize();
		});

	};
	var p = DemoUIMessages.prototype;

	// =========================================================================
	// MEMBER
	// =========================================================================

	p.messageTimer = null;

	// =========================================================================
	// INIT
	// =========================================================================

	p.initialize = function () {
		this._initToastr();
		
		$('#toast-info').trigger('click');
	};

	// =========================================================================
	// INIT TOASTR
	// =========================================================================

	// events
	p._initToastr = function () {
		this._initStateToastr();
		this._initCustomToastr();
		this._initPositionToastr();
		this._initActionToastr();
	};

	// =========================================================================
	// CUSTOM TOASTS
	// =========================================================================
	
	p._initCustomToastr = function () {
		var o = this;
		$('#toast-custom').on('click', function (e) {
			toastr.options.hideDuration = 0;
			toastr.clear();
			
			toastr.options.closeButton = ($('select[name="closeButton"]').val() === 'true');
			toastr.options.progressBar = ($('select[name="progressBar"]').val() === 'true');
			toastr.options.debug = ($('select[name="debug"]').val() === 'true');
			toastr.options.positionClass = $('select[name="positionClass"]').val();
			toastr.options.showDuration = parseInt($('select[name="showDuration"]').val());
			toastr.options.hideDuration = parseInt($('select[name="hideDuration"]').val());
			toastr.options.timeOut = parseInt($('select[name="timeOut"]').val());
			toastr.options.extendedTimeOut = parseInt($('select[name="extendedTimeOut"]').val());
			toastr.options.showEasing = $('select[name="showEasing"]').val();
			toastr.options.hideEasing = $('select[name="hideEasing"]').val();
			toastr.options.showMethod = $('select[name="showMethod"]').val();
			toastr.options.hideMethod = $('select[name="hideMethod"]').val();

			toastr[$('#state').val()]($('#message').val(), '');
		});
	};
	p._showCustomMessage = function () {
		toastr.options.closeButton = ($('select[name="closeButton"]').val() === 'true');
		toastr.options.progressBar = ($('select[name="progressBar"]').val() === 'true');
		toastr.options.debug = ($('select[name="debug"]').val() === 'true');
		toastr.options.positionClass = $('select[name="positionClass"]').val();
		toastr.options.showDuration = parseInt($('select[name="showDuration"]').val());
		toastr.options.hideDuration = parseInt($('select[name="hideDuration"]').val());
		toastr.options.timeOut = parseInt($('select[name="timeOut"]').val());
		toastr.options.extendedTimeOut = parseInt($('select[name="extendedTimeOut"]').val());
		toastr.options.showEasing = $('select[name="showEasing"]').val();
		toastr.options.hideEasing = $('select[name="hideEasing"]').val();
		toastr.options.showMethod = $('select[name="showMethod"]').val();
		toastr.options.hideMethod = $('select[name="hideMethod"]').val();

		toastr[$('#state').val()]($('#message').val(), '');
	};

	// =========================================================================
	// STATE TOASTS
	// =========================================================================

	p._initStateToastr = function () {
		var o = this;
		$('#toast-info').on('click', function (e) {
			o._toastrStateConfig();
			toastr.info('Welcome to the messages section', '');
		});
		$('#toast-warning').on('click', function (e) {
			o._toastrStateConfig();
			toastr.warning('This name is already added', '');
		});
		$('#toast-error').on('click', function (e) {
			o._toastrStateConfig();
			toastr.error('Duplicate item', '');
		});
		$('#toast-success').on('click', function (e) {
			o._toastrStateConfig();
			toastr.success('Added to catalog', '');
		});
	};

	// =========================================================================
	// POSITION TOASTS
	// =========================================================================

	p._initPositionToastr = function () {
		var o = this;
		$('.position-toast').on('click', function (e) {
			toastr.options.hideDuration = 0;
			toastr.clear();
			o._toastrStateConfig();
			toastr.options.timeOut = 0;
			toastr.options.positionClass = $(e.currentTarget).data('position');
			toastr.info('Position message', '');
		});
	};
	
	// =========================================================================
	// ACTION TOASTS
	// =========================================================================

	p._initActionToastr = function () {
		var o = this;
		$('#toast-info-progress').on('click', function (e) {
			toastr.clear();

			o._toastrStateConfig();
			toastr.options.progressBar = true;
			toastr.info('Message with a progressbar', '');
		});
		$('#toast-info-close').on('click', function (e) {
			toastr.clear();

			o._toastrStateConfig();
			toastr.options.closeButton = true;
			toastr.info('Message with a close button', '');
		});

		$('#toast-action').on('click', function (e) {
			toastr.clear();

			toastr.options.closeButton = false;
			toastr.options.progressBar = false;
			toastr.options.debug = false;
			toastr.options.positionClass = 'toast-bottom-left';
			toastr.options.showDuration = 333;
			toastr.options.hideDuration = 333;
			toastr.options.timeOut = 0;
			toastr.options.extendedTimeOut = 1000;
			toastr.options.showEasing = 'swing';
			toastr.options.hideEasing = 'swing';
			toastr.options.showMethod = 'slideDown';
			toastr.options.hideMethod = 'slideUp';

			var message = 'Marked as read. <button type="button" id="okBtn" class="btn btn-flat btn-success toastr-action">Undo</button>';

			toastr.info(message, '');
		});

		$('#toast-long-action').on('click', function (e) {
			toastr.clear();

			toastr.options.closeButton = false;
			toastr.options.progressBar = false;
			toastr.options.debug = false;
			toastr.options.positionClass = 'toast-bottom-left';
			toastr.options.showDuration = 333;
			toastr.options.hideDuration = 333;
			toastr.options.timeOut = 0;
			toastr.options.extendedTimeOut = 1000;
			toastr.options.showEasing = 'swing';
			toastr.options.hideEasing = 'swing';
			toastr.options.showMethod = 'slideDown';
			toastr.options.hideMethod = 'slideUp';

			var message = 'Connection timed out due to firewall setup. Showing limited. <button type="button" id="okBtn" class="btn btn-flat btn-warning toastr-action">Retry</button>';
			toastr.info(message, '');
		});
	};

	// =========================================================================
	// TOAST CONFIG
	// =========================================================================

	p._toastrStateConfig = function () {
		toastr.options.closeButton = false;
		toastr.options.progressBar = false;
		toastr.options.debug = false;
		toastr.options.positionClass = 'toast-bottom-left';
		toastr.options.showDuration = 333;
		toastr.options.hideDuration = 333;
		toastr.options.timeOut = 4000;
		toastr.options.extendedTimeOut = 4000;
		toastr.options.showEasing = 'swing';
		toastr.options.hideEasing = 'swing';
		toastr.options.showMethod = 'slideDown';
		toastr.options.hideMethod = 'slideUp';
	};

	// =========================================================================
	namespace.DemoUIMessages = new DemoUIMessages;
}(this.materialadmin, jQuery)); // pass in (namespace, jQuery):
