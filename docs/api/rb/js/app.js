function createSourceLinks() {
    $('.method_details_list .source_code').
        before("<span class='showSource'>[<a href='#' class='toggleSource'>View source</a>]</span>");
    $('.toggleSource').toggle(function() {
       $(this).parent().next().slideDown(100);
       $(this).text("Hide source");
    },
    function() {
        $(this).parent().next().slideUp(100);
        $(this).text("View source");
    });
}

function createDefineLinks() {
    var tHeight = 0;
    $('.defines').after(" <a href='#' class='toggleDefines'>more...</a>");
    $('.toggleDefines').toggle(function() {
        tHeight = $(this).parent().prev().height();
        $(this).prev().show();
        $(this).parent().prev().height($(this).parent().height());
        $(this).text("(less)");
    },
    function() {
        $(this).prev().hide();
        $(this).parent().prev().height(tHeight);
        $(this).text("more...")
    });
}

function createFullTreeLinks() {
    var tHeight = 0;
    $('.inheritanceTree').toggle(function() {
        tHeight = $(this).parent().prev().height();
        $(this).prev().prev().hide();
        $(this).prev().show();
        $(this).text("(hide)");
        $(this).parent().prev().height($(this).parent().height());
    },
    function() {
        $(this).prev().prev().show();
        $(this).prev().hide();
        $(this).parent().prev().height(tHeight);
        $(this).text("show all")
    });
}

function fixBoxInfoHeights() {
    $('dl.box dd.r1, dl.box dd.r2').each(function() {
       $(this).prev().height($(this).height()); 
    });
}

function searchFrameLinks() {
  $('#method_list_link').click(function() {
    toggleSearchFrame(this, relpath + 'method_list.html');
  });

  $('#class_list_link').click(function() {
    toggleSearchFrame(this, relpath + 'class_list.html');
  });

  $('#file_list_link').click(function() {
    toggleSearchFrame(this, relpath + 'file_list.html');
  });
}

function toggleSearchFrame(id, link) {
  var frame = $('#search_frame');
  $('#search a').removeClass('active').addClass('inactive');
  if (frame.attr('src') == link && frame.css('display') != "none") {
    frame.slideUp(100);
    $('#search a').removeClass('active inactive');
  }
  else {
    $(id).addClass('active').removeClass('inactive');
    frame.attr('src', link).slideDown(100);
  }
}

function linkSummaries() {
  $('.summary_signature').click(function() {
    document.location = $(this).find('a').attr('href');
  });
}

function framesInit() {
  if (window.top.frames.main) {
    document.body.className = 'frames';
    $('#menu .noframes a').attr('href', document.location);
  }
}

function keyboardShortcuts() {
  $(document).keypress(function(evt) {
    if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) return;
    switch (evt.charCode) {
      case 67: case 99:  $('#class_list_link').click(); break;  // 'c'
      case 77: case 109: $('#method_list_link').click(); break; // 'm'
      case 70: case 102: $('#file_list_link').click(); break;   // 'f'
    }
  });
}

$(framesInit);
$(createSourceLinks);
$(createDefineLinks);
$(createFullTreeLinks);
$(fixBoxInfoHeights);
$(searchFrameLinks);
$(linkSummaries);
$(keyboardShortcuts);
