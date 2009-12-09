require "#{File.dirname(__FILE__)}/spec_helper"

describe "Navigation" do
  it "should navigate back and forward" do
    driver.navigate.to url_for("formPage.html")
    driver.current_url.should == url_for("formPage.html")

    driver.find_element(:id, 'imageButton').submit
    driver.find_element(:id, 'greeting').text.should == "Success!"

    driver.navigate.back
    driver.current_url.should == url_for("formPage.html")

    driver.navigate.forward
    driver.find_element(:id, 'greeting').text.should == "Success!"
  end

  not_compliant_on :browser => :ie do
    it "should refresh the page" do
      driver.navigate.to url_for("javascriptPage.html")
      driver.find_element(:xpath, '//a[text() = "Change the page title!"]').click
      driver.title.should == "Changed"

      driver.navigate.refresh
      driver.title.should == "Testing Javascript"
    end
  end
end

