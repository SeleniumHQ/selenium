function fullListSearch() {
  $('#search input').keyup(function() {
    var value = this.value.toLowerCase();
    if (value == "") {
      $('#full_list').removeClass('insearch');
      $('#full_list li').each(function() {
        var link = $(this).children('a:last');
        link.text(link.text()); 
      });
      if (clicked) {
        clicked.parents('ul').each(function() {
          $(this).removeClass('collapsed').prev().removeClass('collapsed');
        });
      }
      highlight();
    }
    else {
      $('#full_list').addClass('insearch');
      $('#full_list li').each(function() {
        var link = $(this).children('a:last');
        var text = link.text();
        if (text.toLowerCase().indexOf(value) == -1) {
          $(this).removeClass('found');
          link.text(link.text());
        }
        else {
          $(this).css('padding-left', '10px').addClass('found');
          link.html(link.text().replace(new RegExp("(" + 
            value.replace(/([\/.*+?|()\[\]{}\\])/g, "\\$1") + ")", "ig"), 
            '<strong>$1</strong>'));
        }
      });
      highlight(true);
    }
    
    if ($('#full_list li:visible').size() == 0) {
      $('#noresults').fadeIn();
    }
    else {
      $('#noresults').hide();
    }
  });
  
  $('#search input').focus();
  $('#full_list').after("<div id='noresults'>No results were found.</div>")
}

clicked = null;
function linkList() {
  $('#full_list li, #full_list li a:last').click(function(evt) {
    if ($(this).hasClass('toggle')) return true;
    if (this.tagName.toLowerCase() == "li") {
      var toggle = $(this).children('a.toggle');
      if (toggle.size() > 0 && evt.pageX < toggle.offset().left) {
        toggle.click();
        return false;
      }
    }
    if (clicked) clicked.removeClass('clicked');
    var win = window.parent;
    if (window.top.frames.main) {
      win = window.top.frames.main;
      var title = $('html head title', win.document).text();
      $('html head title', window.parent.document).text(title);
    }
    if (this.tagName.toLowerCase() == "a") {
      clicked = $(this).parent('li').addClass('clicked');
      win.location = this.href;
    }
    else {
      clicked = $(this).addClass('clicked');
      win.location = $(this).find('a:last').attr('href');
    }
    return false;
  });
}

function collapse() {
  if (!$('#full_list').hasClass('class')) return;
  $('#full_list.class a.toggle').click(function() { 
    $(this).parent().toggleClass('collapsed').next().toggleClass('collapsed');
    highlight();
    return false; 
  });
  $('#full_list.class ul').each(function() {
    $(this).addClass('collapsed').prev().addClass('collapsed');
  });
  $('#full_list.class').children().removeClass('collapsed');
  highlight();
}

function highlight(no_padding) {
  var n = 1;
  $('#full_list li:visible').each(function() {
    var next = n == 1 ? 2 : 1;
    $(this).removeClass("r" + next).addClass("r" + n);
    if (!no_padding && $('#full_list').hasClass('class')) {
      $(this).css('padding-left', (10 + $(this).parents('ul').size() * 15) + 'px');
    }
    n = next;
  });
}

function escapeShortcut() {
  $(document).keydown(function(evt) {
    if (evt.which == 27) {
      $('#search_frame', window.top.document).slideUp(100);
      $('#search a', window.top.document).removeClass('active inactive')
      $(window.top).focus();
    }
  });
}

$(escapeShortcut);
$(fullListSearch);
$(linkList);
$(collapse);
