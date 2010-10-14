require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Google Search" do
  
  it "can find SeleniumHQ" do
    page.open "http://www.google.com/webhp?hl=en"
    page.title.should eql("Google")
    page.type "q", "Selenium SeleniumHQ"
    page.value("q").should eql("Selenium SeleniumHQ")
    page.click "btnG", :wait_for => :page
    page.text?("seleniumhq.org").should be_true
    page.title.should eql("Selenium SeleniumHQ - Google Search")
  end

  it "wait_for_text variant" do
    page.open "http://www.google.com/webhp?hl=en"
    page.title.should eql("Google")
    page.type "q", "Selenium SeleniumHQ"
    page.value("q").should eql("Selenium SeleniumHQ")
    page.click "btnG", :wait_for => :text, :text => "Results"
    page.wait_for :wait_for => :value, :element => 'q', :value => "Selenium SeleniumHQ"
    page.wait_for :wait_for => :no_value, :element => 'q', :value => "Mercury"
    page.wait_for :wait_for => :no_text, :text => "Gre sacdas asdcasd"
    page.title.should eql("Selenium SeleniumHQ - Google Search")
  end

  it "can search videos" do
    page.open "http://video.google.com"
    page.type "q", "hello world"
    page.click "search-button"
  end
    
end