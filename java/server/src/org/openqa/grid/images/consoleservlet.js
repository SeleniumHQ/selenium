(function main() {
  "use strict";

  function show(proxy, section) {
    proxy.find('.tab').each(function() {
      var current = $(this).attr('type');
      if (current === section) {
        $(this).addClass('selected');
      } else {
        $(this).removeClass('selected');
      }
    });

    proxy.find(".content_detail").each(function() {
      var current = $(this).attr('type');
      if (current === section) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  }

  function showDefaults() {
    $(".proxy").each(function() {
      show($(this), 'browsers');
    });
  }

  $(document).ready(function() {
    $(".tabs li").click(function(event) {
      var currentProxy = $(this).closest('.proxy');
      var type = $(this).attr('type');
      show(currentProxy, type);
      event.preventDefault(); // Prevent the click from going to the top of the page
    });

    // On Click, toggle Config Container's Visibility, Update Link Text
    $("#config-view-toggle").click(function(event) {
      var configDetails = $("#hub-config-content");
      if(configDetails.is(':visible')) {
        configDetails.hide();
        $(this).text('View Config'); // Update toggle link text
      } else {
          configDetails.show();
          $(this).text('Hide Config'); // Update toggle link text
      }
      event.preventDefault(); // Prevent click from going to the top of the page
    });

    // Register click event for View Verbose config link
    $("#verbose-config-view-toggle").click(function(event) {
      $("#verbose-config-content").toggle(); // Toggle visibility
      $(this).hide(); // Hide link after being clicked
      event.preventDefault(); // Prevent click from going to the top of the page
    });

    showDefaults();
  });
}());
