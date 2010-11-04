require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Click Instrumentation" do
  it "clicks" do
    page.open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    page.text_content("link").should eql("Click here for next page")

    page.click "link", :wait_for => :page
    page.title.should eql("Click Page Target")

    page.click "previousPage", :wait_for => :page
    page.title.should eql("Click Page 1")

    page.click "linkWithEnclosedImage", :wait_for => :page
    page.title.should eql("Click Page Target")

    page.click "previousPage", :wait_for => :page
    page.click "enclosedImage", :wait_for => :page
    page.title.should eql("Click Page Target")

    page.click "previousPage", :wait_for => :page
    page.click "extraEnclosedImage", :wait_for => :page
    page.title.should eql("Click Page Target")

    page.click "previousPage", :wait_for => :page
    page.click "linkToAnchorOnThisPage"
    page.title.should eql("Click Page 1")

    page.click "linkWithOnclickReturnsFalse"
    page.title.should eql("Click Page 1")
  end

  it "double clicks" do
    page.open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"
    page.double_click "doubleClickable"

    page.get_alert.should eql("double clicked!")
  end
end
