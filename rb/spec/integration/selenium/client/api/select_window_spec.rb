require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Window Selection" do
  it "selects and close popup windows" do
    page.open "http://localhost:4444/selenium-server/tests/html/test_select_window.html"
    page.click "popupPage", :wait_for => :popup, :window => "myPopupWindow", :select => true

    page.location.should =~ %r{/tests/html/test_select_window_popup.html}
    page.title.should =~ /Select Window Popup/
    page.all_window_names.size.should eql(2)
    page.all_window_names.include?("myPopupWindow").should be_true

    page.close
    page.select_window "null"

    page.location.should =~ %r{/tests/html/test_select_window.html}

    page.click "popupPage", :wait_for => :popup, :window => "myPopupWindow"
    page.select_window "title=Select Window Popup"

    page.location.should =~ %r{/tests/html/test_select_window_popup.html}

    page.close
    page.select_window "null"
  end

  it "select an anonymous window (one that isn't assigned to a variable)" do
    page.open "http://localhost:4444/selenium-server/tests/html/test_select_window.html"
    page.click "popupAnonymous", :wait_for => :popup, :window => "anonymouspopup", :select => true

    page.location.should =~ %r{/tests/html/test_select_window_popup.html}

    page.click "closePage"
    page.select_window "null"
  end

  it "handles an onclick close handler" do
    page.open "http://localhost:4444/selenium-server/tests/html/test_select_window.html"
    page.click "popupAnonymous", :wait_for => :popup, :window => "anonymouspopup", :select => true

    page.location.should =~ %r{/tests/html/test_select_window_popup.html}

    page.click "closePage2"
    page.select_window "null"
  end
end
