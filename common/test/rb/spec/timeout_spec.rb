require "#{File.dirname(__FILE__)}/spec_helper"

describe "Timeouts" do

  before do
    driver.manage.timeouts.implicit_wait = 0
    driver.navigate.to url_for("dynamic.html")
  end

  after { driver.manage.timeouts.implicit_wait = 0 }

  it "should implicitly wait for a single element" do
    driver.manage.timeouts.implicit_wait = 1.1

    driver.find_element(:id => 'adder').click
    driver.find_element(:id => 'box0')
  end

  it "should still fail to find an element with implicit waits enabled" do
    driver.manage.timeouts.implicit_wait = 0.5
    lambda { driver.find_element(:id => "box0") }.should raise_error(WebDriver::Error::NoSuchElementError)
  end

  it "should return after first attempt to find one after disabling implicit waits" do
    driver.manage.timeouts.implicit_wait = 1.1
    driver.manage.timeouts.implicit_wait = 0

    lambda { driver.find_element(:id => "box0") }.should raise_error(WebDriver::Error::NoSuchElementError)
  end

  it "should implicitly wait until at least one element is found when searching for many" do
    add = driver.find_element(:id => "adder")

    driver.manage.timeouts.implicit_wait = 2
    add.click
    add.click

    driver.find_elements(:class_name => "redbox").should_not be_empty
  end

  it "should still fail to find elements when implicit waits are enabled" do
    driver.manage.timeouts.implicit_wait = 0.5
    driver.find_elements(:class_name => "redbox").should be_empty
  end

  it "should return after first attempt to find many after disabling implicit waits" do
    add = driver.find_element(:id => "adder")

    driver.manage.timeouts.implicit_wait = 1.1
    driver.manage.timeouts.implicit_wait = 0
    add.click

    driver.find_elements(:class_name => "redbox").should be_empty
  end

end



