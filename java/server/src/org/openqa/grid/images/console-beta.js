function show(proxy, section) {
	proxy.find('.tab').each(function(i) {
		var current = $(this).attr('type');
		if (current === section) {
			$(this).addClass('selected');
		} else {
			$(this).removeClass('selected');
		}
	});

	proxy.find(".content_detail").each(function(i) {
		var current = $(this).attr('type');
		if (current === section) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});

}

function showDefaults() {
	$(".proxy").each(function(i) {
		show($(this), 'browsers');
	});
}

$(document).ready(function() {
	$(".tabs li").click(function(event) {
		var currentProxy = $(this).closest('.proxy');
		var type = $(this).attr('type');
		show(currentProxy, type);
	});

	showDefaults();

});