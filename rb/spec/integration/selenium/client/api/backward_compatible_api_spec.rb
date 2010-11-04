require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Backward Compatible API" do
  it "provides legacy driver methods" do
		page.open "http://localhost:4444/selenium-server/tests/html/test_click_page1.html"

    page.get_title.should eql("Click Page 1")
		page.get_text("link").index("Click here for next page").should_not be_nil

		links = page.get_all_links
		links.length.should > 3
		links[3].should eql("linkToAnchorOnThisPage")

		page.click "link"
		page.wait_for_page_to_load 5000
		page.get_location.should =~ %r"/selenium-server/tests/html/test_click_page2.html"

		page.click "previousPage"
		page.wait_for_page_to_load 5000
		page.get_location.should =~ %r"/selenium-server/tests/html/test_click_page1.html"
  end
end
