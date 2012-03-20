require File.expand_path("../spec_helper", __FILE__)

describe "Navigation" do
  let(:wait) { Selenium::WebDriver::Wait.new :timeout => 10 }

  not_compliant_on :browser => :safari do
    it "should navigate back and forward" do
      form_title   = "We Leave From Here"
      result_title = "We Arrive Here"
      form_url     = url_for "formPage.html"
      result_url   = url_for "resultPage.html"

      driver.navigate.to form_url
      driver.title.should == form_title

      driver.find_element(:id, 'imageButton').submit
      wait.until { driver.title != form_title }

      driver.current_url.should include(result_url)
      driver.title.should == result_title

      driver.navigate.back

      driver.current_url.should include(form_url)
      driver.title.should == form_title

      driver.navigate.forward
      driver.current_url.should include(result_url)
      driver.title.should == result_title
    end

    it "should refresh the page" do
      changed_title = "Changed"

      driver.navigate.to url_for("javascriptPage.html")
      driver.find_element(:link_text, "Change the page title!").click
      driver.title.should == changed_title

      driver.navigate.refresh
      wait.until { driver.title != changed_title }

      driver.title.should == "Testing Javascript"
    end
  end
end

