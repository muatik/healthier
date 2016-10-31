(function (namespace, $) {
	"use strict";

	var DemoFormEditors = function () {
		// Create reference to this instance
		var o = this;
		// Initialize app when document is ready
		$(document).ready(function () {
			o.initialize();
		});

	};
	var p = DemoFormEditors.prototype;

	// =========================================================================
	// INIT
	// =========================================================================

	p.initialize = function () {
		this._initSummernote();
		this._initCKEditor();
	};

	// =========================================================================
	// SUMMERNOTE EDITOR
	// =========================================================================

	p._initSummernote = function () {
		if (!$.isFunction($.fn.summernote)) {
			return;
		}

		// Full toolbar
		$('#summernote').summernote();
		
		// Simple toolbar
		$('#simple-summernote').summernote({
			height: $('#simple-summernote').height(),
			toolbar: [
				['style', ['bold', 'italic', 'underline', 'clear']],
				['fontsize', ['fontsize']],
				['color', ['color']],
				['para', ['ul', 'ol', 'paragraph']],
				['height', ['height']]
			]
		});
	};

	// =========================================================================
	// CKEDITOR
	// =========================================================================

	p._initCKEditor = function () {
		$('#ckeditor').ckeditor();

		// By default, CKEditor add a WYSIWEG editor to all content with the contenteditable set to true
		// To be able to demo Summernote on this page, this function is disabled.
		CKEDITOR.disableAutoInline = true;
		if ($('#inlineContent1').length > 0)
			CKEDITOR.inline('inlineContent1');
		if ($('#inlineContent2').length > 0)
			CKEDITOR.inline('inlineContent2');
	};

	// =========================================================================
	namespace.DemoFormEditors = new DemoFormEditors;
}(this.materialadmin, jQuery)); // pass in (namespace, jQuery):
