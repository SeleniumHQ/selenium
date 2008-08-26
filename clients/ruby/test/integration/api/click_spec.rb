require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Click Instrumentation" do

  it "clicks" do
    selenium_driver.start_new_browser_session

    page.open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    page.get_text("link").should eql("Click here for next page")
    page.click "link"
    page.wait_for_page_to_load "30000"
    page.get_title.should eql("Click Page Target")
    page.click "previousPage"
    page.wait_for_page_to_load "30000"
    page.get_title.should eql("Click Page 1")
    page.click "linkWithEnclosedImage"
    page.wait_for_page_to_load "30000"
    page.get_title.should eql("Click Page Target")
    page.click "previousPage"
    page.wait_for_page_to_load "30000"
    page.click "enclosedImage"
    page.wait_for_page_to_load "30000"
    page.get_title.should eql("Click Page Target")
    page.click "previousPage"
    page.wait_for_page_to_load "30000"
    page.click "extraEnclosedImage"
    page.wait_for_page_to_load "30000"
    page.get_title.should eql("Click Page Target")
    page.click "previousPage"
    page.wait_for_page_to_load "30000"
    page.click "linkToAnchorOnThisPage"
    page.get_title.should eql("Click Page 1")
    page.click "linkWithOnclickReturnsFalse"
    page.get_title.should eql("Click Page 1")
  end

  it "double clicks" do
    selenium_driver.start_new_browser_session
    
    page.open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    page.double_click "doubleClickable"
    page.get_alert.should eql("double clicked!")
  end
  
end