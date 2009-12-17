function fullListSearch() {
  $('#search input').keyup(function() {
    var value = this.value.toLowerCase();
    if (value == "") {
      $('#full_list li').show();
    }
    else {
      $('#full_list li').each(function() {
        if ($(this).children('a').text().toLowerCase().indexOf(value) == -1) {
          $(this).hide();
        }
        else {
          $(this).show();
        }
      });
    }
    $('#full_list li:even:visible').removeClass('r2').addClass('r1');
    $('#full_list li:odd:visible').removeClass('r1').addClass('r2');
    
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

function linkList() {
  $('#full_list li').click(function() {
    window.parent.location = $(this).find('a').attr('href');
  });
}

$(fullListSearch);
$(linkList);