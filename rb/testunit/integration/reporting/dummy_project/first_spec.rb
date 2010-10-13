require File.expand_path(__FILE__ + '/../spec_helper')

describe "An Amazing Web Application" do

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
  
  it "Test case that fails because the browser is not supported" do
    create_selenium_driver :browser => '*invalidbrowser'
    start_new_browser_session
  end
  
  it "Test case that fails because it cannot contact the application under test" do
    create_selenium_driver :application_host => 'invalid.host.closeqa.com', :timeout => 1
    selenium_driver.start_new_browser_session
  end
  
  it "Test case that fails because it cannot contact the remote control" do
    create_selenium_driver :host => 'invalid.host.closeqa.com', :timeout => 1
    start_new_browser_session
  end
  
  it "Test case that fails because of a bug in the instrumentation (session not started)" do
    create_selenium_driver
  
    page.open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
  end
  
  it "Another test case that passes" do
    create_selenium_driver
    start_new_browser_session
    
      page.open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    page.double_click "doubleClickable"
    page.alert.should eql("double clicked!")
  end
  
end