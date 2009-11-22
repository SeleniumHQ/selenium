require "#{File.dirname(__FILE__)}/spec_helper"

describe "Error" do

  deviates_on :browser => :firefox do
    it "should have an appropriate message" do
      driver.navigate.to url_for("xhtmlTest.html")

      lambda { driver.find_element(:id, "nonexistant") }.should raise_error(
          WebDriver::Error::NoSuchElementError, /Unable to (find|locate) element/ # TODO: pick one of "find" vs "locate"
      )
    end
  end

  it "should show stack trace information"
end