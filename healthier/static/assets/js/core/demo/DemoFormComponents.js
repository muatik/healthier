(function (namespace, $) {
	"use strict";

	var DemoFormComponents = function () {
		// Create reference to this instance
		var o = this;
		// Initialize app when document is ready
		$(document).ready(function () {
			o.initialize();
		});

	};
	var p = DemoFormComponents.prototype;

	// =========================================================================
	// INIT
	// =========================================================================

	p.initialize = function () {
		this._initTypeahead();
		this._initAutocomplete();
		this._initSelect2();
		this._initMultiSelect();
		this._initInputMask();
		this._initDatePicker();
		this._initSliders();
		this._initSpinners();
		this._initColorPickers();
	};

	// =========================================================================
	// TYPEAHEAD
	// =========================================================================

	p._initTypeahead = function () {
		if (!$.isFunction($.fn.typeahead)) {
			return;
		}
		var countries = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			limit: 10,
			prefetch: {
				// url points to a json file that contains an array of country names, see
				// https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
				url: $('#autocomplete1').data('source'),
				// the json file contains an array of strings, but the Bloodhound
				// suggestion engine expects JavaScript objects so this converts all of
				// those strings
				filter: function (list) {
					return $.map(list, function (country) {
						return {name: country};
					});
				}
			}
		});
		countries.initialize();
		$('#autocomplete1').typeahead(null, {
			name: 'countries',
			displayKey: 'name',
			// `ttAdapter` wraps the suggestion engine in an adapter that
			// is compatible with the typeahead jQuery plugin
			source: countries.ttAdapter()
		});
	};
	
	// =========================================================================
	// AUTOCOMPLETE
	// =========================================================================

	p._initAutocomplete = function () {
		if (!$.isFunction($.fn.autocomplete)) {
			return;
		}

		$.ajax({
			url: $('#autocomplete2').data('source'),
			dataType: "json",
			success: function (countries) {
				$("#autocomplete2").autocomplete({
					source: function (request, response) {
						var results = $.ui.autocomplete.filter(countries, request.term);
						response(results.slice(0, 10));
					}
				});
			}
		});
	};

	// =========================================================================
	// COLORPICKER
	// =========================================================================

	p._initColorPickers = function () {
		if (!$.isFunction($.fn.colorpicker)) {
			return;
		}
		$('#cp1').colorpicker();
		$('#cp2').colorpicker();
		$('#cp3').colorpicker().on('changeColor', function (ev) {
			$(ev.currentTarget).closest('.card-body').css('background', ev.color.toHex());
		});
	};

	// =========================================================================
	// SPINNERS
	// =========================================================================

	p._initSpinners = function () {
		if (!$.isFunction($.fn.spinner)) {
			return;
		}
		$("#spinner").spinner({min: 16});
		$("#spinner-decimal").spinner({step: 0.01, numberFormat: "n", max: 1});
	};

	// =========================================================================
	// SLIDERS
	// =========================================================================

	p._initSliders = function () {
		if (!$.isFunction($.fn.slider)) {
			return;
		}
		$("#slider").slider({range: "min", value: 50, min: 0, max: 100,
			slide: function (event, ui) {
				$('#slider-value').empty().append(ui.value);
			}
		});
		$("#slider-step").slider({value: 100, min: 0, max: 500, step: 50,
			slide: function (event, ui) {
				$('#step-value').empty().append(ui.value);
			}
		});
		$("#slider-range").slider({range: true, min: 0, max: 100, values: [25, 75],
			slide: function (event, ui) {
				$('#range-value1').empty().append(ui.values[ 0 ]);
				$('#range-value2').empty().append(ui.values[ 1 ]);
			}
		});

		$("#eq > span").each(function () {
			var value = parseInt($(this).text(), 10);
			$(this).empty().slider({value: value, range: "min", animate: true, orientation: "vertical"});
			$(this).css('height', '100px');
			$(this).css('margin-right', '30px');
			$(this).css('float', 'left');
		});
	};

	// =========================================================================
	// SELECT2
	// =========================================================================

	p._initSelect2 = function () {
		if (!$.isFunction($.fn.select2)) {
			return;
		}
		$(".select2-list").select2({
			allowClear: true
		});
	};

	// =========================================================================
	// MultiSelect
	// =========================================================================

	p._initMultiSelect = function () {
		if (!$.isFunction($.fn.multiSelect)) {
			return;
		}
		$('#optgroup').multiSelect({selectableOptgroup: true});
	};

	// =========================================================================
	// InputMask
	// =========================================================================

	p._initInputMask = function () {
		if (!$.isFunction($.fn.inputmask)) {
			return;
		}
		$(":input").inputmask();
		$(".form-control.dollar-mask").inputmask('$ 999,999,999.99', {numericInput: true, rightAlignNumerics: false});
		$(".form-control.euro-mask").inputmask('€ 999.999.999,99', {numericInput: true, rightAlignNumerics: false});
		$(".form-control.time-mask").inputmask('h:s', {placeholder: 'hh:mm'});
		$(".form-control.time12-mask").inputmask('hh:mm t', {placeholder: 'hh:mm xm', alias: 'time12', hourFormat: '12'});
	};

	// =========================================================================
	// Date Picker
	// =========================================================================

	p._initDatePicker = function () {
		if (!$.isFunction($.fn.datepicker)) {
			return;
		}

		$('#demo-date').datepicker({autoclose: true, todayHighlight: true});
		$('#demo-date-month').datepicker({autoclose: true, todayHighlight: true, minViewMode: 1});
		$('#demo-date-format').datepicker({autoclose: true, todayHighlight: true, format: "yyyy/mm/dd"});
		$('#demo-date-range').datepicker({todayHighlight: true});
		$('#demo-date-inline').datepicker({todayHighlight: true});
	};

	// =========================================================================
	// DATATABLES
	// =========================================================================

	p.initDataTables = function (grid) {
		if (!$.isFunction($.fn.dataTable)) {
			return;
		}

		$.extend(jQuery.fn.dataTableExt.oSort, {
			"numeric-comma-pre": function (a) {
				var x = (a == "-") ? 0 : a.replace(/,/, ".");
				return parseFloat(x);
			},
			"numeric-comma-asc": function (a, b) {
				return ((a < b) ? -1 : ((a > b) ? 1 : 0));
			},
			"numeric-comma-desc": function (a, b) {
				return ((a < b) ? 1 : ((a > b) ? -1 : 0));
			}
		});
		grid.dataTable({
			"sDom": 'lCfrtip',
			"sPaginationType": "full_numbers",
			"aaSorting": [],
			"aoColumns": [
				null,
				null,
				null,
				{"sType": "numeric-comma"},
				null
			],
			"oColVis": {
				"buttonText": "Columns",
				"iOverlayFade": 0,
				"sAlign": "right"
			},
			"oLanguage": {
				"sLengthMenu": '_MENU_ entries per page',
				"sSearch": '<i class="icon-search"></i>',
				"oPaginate": {
					"sPrevious": '<i class="fa fa-angle-left"></i>',
					"sNext": '<i class="fa fa-angle-right"></i>'
				}
			}
		});
	};

	// =========================================================================
	namespace.DemoFormComponents = new DemoFormComponents;
}(this.materialadmin, jQuery)); // pass in (namespace, jQuery):
