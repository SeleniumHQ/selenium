require File.expand_path("../spec_helper", __FILE__)

describe "Navigation" do
  it "should navigate back and forward" do
    driver.navigate.to url_for("formPage.html")
    driver.current_url.should == url_for("formPage.html")

    driver.find_element(:id, 'imageButton').submit
    driver.title.should == "We Arrive Here"

    driver.navigate.back
    driver.current_url.should == url_for("formPage.html")
    driver.title.should == "We Leave From Here"

    driver.navigate.forward
    driver.title.should == "We Arrive Here"
  end

  it "should refresh the page" do
    driver.navigate.to url_for("javascriptPage.html")
    driver.find_element(:xpath, '//a[text() = "Change the page title!"]').click
    driver.title.should == "Changed"

    driver.navigate.refresh
    driver.title.should == "Testing Javascript"
  end
end

