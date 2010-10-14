require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Window Selection" do

  it "Selects and close popup windows " do
    pending_for_browsers(/safari/) do    
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
  end

  it "Select an anonymous window (one that isn't assigned to a variable)" do
    pending_for_browsers(/safari/) do    
      page.open "http://localhost:4444/selenium-server/tests/html/test_select_window.html"
      page.click "popupAnonymous", :wait_for => :popup, :window => "anonymouspopup", :select => true
      page.location.should =~ %r{/tests/html/test_select_window_popup.html}
      page.click "closePage"
      page.select_window "null"
    end
  end

  it "Try onclick close handler" do
    pending_for_browsers(/safari/) do    
      page.open "http://localhost:4444/selenium-server/tests/html/test_select_window.html"
      page.click "popupAnonymous", :wait_for => :popup, :window => "anonymouspopup", :select => true
      page.location.should =~ %r{/tests/html/test_select_window_popup.html}
      page.click "closePage2"
    end
  end
  
end
