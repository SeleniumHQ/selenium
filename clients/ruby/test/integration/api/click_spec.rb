require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Click Instrumentation" do

  it "clicks" do
    start    
    open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    get_text("link").should eql("Click here for next page")
    click "link"
    wait_for_page_to_load "30000"
    get_title.should eql("Click Page Target")
    click "previousPage"
      wait_for_page_to_load "30000"
    get_title.should eql("Click Page 1")
    click "linkWithEnclosedImage"
      wait_for_page_to_load "30000"
    get_title.should eql("Click Page Target")
    click "previousPage"
      wait_for_page_to_load "30000"
    click "enclosedImage"
      wait_for_page_to_load "30000"
    get_title.should eql("Click Page Target")
    click "previousPage"
      wait_for_page_to_load "30000"
    click "extraEnclosedImage"
      wait_for_page_to_load "30000"
    get_title.should eql("Click Page Target")
    click "previousPage"
      wait_for_page_to_load "30000"
    click "linkToAnchorOnThisPage"
    get_title.should eql("Click Page 1")
    click "linkWithOnclickReturnsFalse"
    get_title.should eql("Click Page 1")
  end

  it "double clicks" do
		open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    double_click "doubleClickable"
    get_alert.should eql("double clicked!")
  end
  
end