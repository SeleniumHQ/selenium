require "#{File.dirname(__FILE__)}/spec_helper"

describe "Error" do

  it "should have an appropriate message" do
    driver.navigate.to url_for("xhtmlTest.html")

    lambda { driver.find_element(:id, "nonexistant") }.should raise_error(
        WebDriver::Error::NoSuchElementError, /unable to (find|locate) element/i # TODO: pick one of "find" vs "locate"
    )
  end

  it "should show stack trace information"
end