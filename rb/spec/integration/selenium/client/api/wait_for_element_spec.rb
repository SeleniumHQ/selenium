require File.expand_path(__FILE__ + '/../../spec_helper')

describe "#wait_for_element" do
  it "does not block when element is present" do
    page.open "http://localhost:4567/jquery.html"
    page.wait_for_element "element-present-demo"
    page.wait_for_element "id=element-present-demo"
    page.wait_for_element "css=#element-present-demo"
  end

  it "times out when element is not present" do
    page.open "http://localhost:4567/jquery.html"

    should_timeout do
      page.wait_for_element "new-element", :timeout_in_seconds => 2
    end

    should_timeout do
      page.wait_for_element "does-not-exists", :timeout_in_seconds => 2
    end
  end

  it "detects dynamics changes in the DOM" do
    page.open "http://localhost:4567/jquery.html"
    page.click "create-element-button", :wait_for => :element, :element => 'new-element'
    page.click "delete-element-button", :wait_for => :no_element, :element => 'new-element'

    should_timeout do
      page.wait_for_element "new-element", :timeout_in_seconds => 2
    end
  end

  it "can handle quotes and double quotes in its locator definition" do
    page.open "http://localhost:4567/jquery.html"
    page.wait_for_element "//div[@id='element-present-demo']"
    page.wait_for_no_element "//div[@id='new-element']"
    page.click "create-element-button", :wait_for => :element, :element => "//div[@id='new-element']"
  end
end

describe "#wait_for_no_element" do
  it "does not block when element is not present" do
    page.open "http://localhost:4567/jquery.html"
    page.wait_for_no_element "new-element"
    page.wait_for_no_element "does-not-exists"
  end

  it "times out when element is present" do
    page.open "http://localhost:4567/jquery.html"

    should_timeout do
      page.wait_for_no_element "element-present-demo", :timeout_in_seconds => 2
    end
  end
end

