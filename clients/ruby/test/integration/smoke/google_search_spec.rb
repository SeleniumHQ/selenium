require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Google Search" do
  
  it "can find OpenQA" do
    selenium_driver.start_new_browser_session
    
    page.open "http://www.google.com/webhp?hl=en"
    page.title.should eql("Google")
    page.type "q", "Selenium OpenQA"
    page.value("q").should eql("Selenium OpenQA")
    page.click "btnG", :wait_for => :page
    page.text?("openqa.org").should be_true
    page.title.should eql("Selenium OpenQA - Google Search")
  end

  it "can search videos" do
    selenium_driver.start_new_browser_session

    page.open "http://video.google.com"
    page.type "q", "hello world"
    page.click "//input[@value='Search Video']"
  end
    
end