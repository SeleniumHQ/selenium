require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Google Search" do
  
  it "can find OpenQA" do
    selenium_driver.start_new_browser_session
    
    page.open "http://www.google.com/webhp?hl=en"
    page.get_title.should eql("Google")
    page.type "q", "Selenium OpenQA"
    page.get_value("q").should eql("Selenium OpenQA")
    page.click "btnG"
    page.wait_for_page_to_load 60000
    page.is_text_present("openqa.org").should be_true
    page.get_title.should eql("Selenium OpenQA - Google Search")
  end

  it "can search videos" do
    selenium_driver.start_new_browser_session

    page.open "http://video.google.com"
    page.type "q", "hello world"
    page.click "//input[@value='Search Video']"
  end
    
end