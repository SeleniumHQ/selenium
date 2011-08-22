require File.expand_path("../spec_helper", __FILE__)

describe Selenium::WebDriver::Error do

  it "should raise an appropriate error" do
    driver.navigate.to url_for("xhtmlTest.html")

    lambda {
      driver.find_element(:id, "nonexistant")
    }.should raise_error(WebDriver::Error::NoSuchElementError)
  end

  compliant_on :driver => [:remote, :firefox] do
    it "should show stack trace information" do
      driver.navigate.to url_for("xhtmlTest.html")

      rescued = false
      ex = nil

      begin
        driver.find_element(:id, "nonexistant")
      rescue => ex
        rescued = true
      end

      rescued.should be_true
      ex.backtrace.first.should include("[remote server]")
    end
  end
end