require File.expand_path(__FILE__ + '/../spec_helper')

describe "Google Search" do
  
  it "can find OpenQA" do
    open "http://www.google.com/webhp?hl=en"
    get_title.should eql("Google")
    type "q", "Selenium OpenQA"
    get_value("q").should eql("Selenium OpenQA")
    click "btnG"
    wait_for_page_to_load 60000
    is_text_present("openqa.org").should be_true
    get_title.should eql("Selenium OpenQA - Google Search")
  end
  
end