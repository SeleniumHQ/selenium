require File.expand_path(__FILE__ + '/../spec_helper')

describe "Another Amazing Web Application" do

  it "Test case that passes" do
    create_selenium_driver
    selenium_driver.start_new_browser_session
  
    page.open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    page.text_content("link").should eql("Click here for next page")
    page.click "link", :wait_for => :page
  end
  
  it "Test case that fails because the application is not behaving as expected" do
    create_selenium_driver
  
    create_selenium_driver
    start_new_browser_session
  
    page.open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    page.click "link_that_does_not_exist"
  end

  it "Test case that is pending" do
    pending "wait for Mosaic browser to be supported" do
      create_selenium_driver :browser => '*mosaic'
      start_new_browser_session
    end    
  end
  
end