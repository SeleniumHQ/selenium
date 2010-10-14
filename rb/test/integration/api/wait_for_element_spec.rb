require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Wait For (No) Element" do

  it "wait_for_element does not block when element is present" do
    page.open "http://localhost:4567/jquery.html"
    page.wait_for_element "element-present-demo"
    page.wait_for_element "id=element-present-demo"
    page.wait_for_element "css=#element-present-demo"
  end

  it "wait_for_no_element does not block when element is not present" do
    page.open "http://localhost:4567/jquery.html"
    page.wait_for_no_element "new-element"
    page.wait_for_no_element "does-not-exists"
  end
  
  it "wait_for_element timeouts when element is not present" do
    page.open "http://localhost:4567/jquery.html"
    should_timeout do
      page.wait_for_element "new-element", :timeout_in_seconds => 2
    end
    should_timeout do
      page.wait_for_element "does-not-exists", :timeout_in_seconds => 2
    end
  end
  
  it "wait_for_no_element timeouts when element is present" do
    page.open "http://localhost:4567/jquery.html"
    should_timeout do
      page.wait_for_no_element "element-present-demo", :timeout_in_seconds => 2
    end
  end
  
  it "wait_for_element detects dynamics changes in the DOM" do
    page.open "http://localhost:4567/jquery.html"
    page.click "create-element-button", :wait_for => :element, :element => 'new-element'
    page.click "delete-element-button", :wait_for => :no_element, :element => 'new-element'
    should_timeout do
      page.wait_for_element "new-element", :timeout_in_seconds => 2
    end
  end
  
  it "wait_for_element can handle quotes and double quotes in its locator definition" do
    page.open "http://localhost:4567/jquery.html"
    page.wait_for_element "//div[@id='element-present-demo']"
    page.wait_for_no_element "//div[@id='new-element']"
    page.click "create-element-button", :wait_for => :element, :element => "//div[@id='new-element']"
  end
  
end
