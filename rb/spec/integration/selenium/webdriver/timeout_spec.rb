require File.expand_path("../spec_helper", __FILE__)

describe "Timeouts" do

  context "implicit waits" do
    before do
      driver.manage.timeouts.implicit_wait = 0
      driver.navigate.to url_for("dynamic.html")
    end

    after { driver.manage.timeouts.implicit_wait = 0 }

    it "should implicitly wait for a single element" do
      driver.manage.timeouts.implicit_wait = 6

      driver.find_element(:id => 'adder').click
      driver.find_element(:id => 'box0')
    end

    it "should still fail to find an element with implicit waits enabled" do
      driver.manage.timeouts.implicit_wait = 0.5
      lambda { driver.find_element(:id => "box0") }.should raise_error(WebDriver::Error::NoSuchElementError)
    end

    it "should return after first attempt to find one after disabling implicit waits" do
      driver.manage.timeouts.implicit_wait = 3
      driver.manage.timeouts.implicit_wait = 0

      lambda { driver.find_element(:id => "box0") }.should raise_error(WebDriver::Error::NoSuchElementError)
    end

    it "should implicitly wait until at least one element is found when searching for many" do
      add = driver.find_element(:id => "adder")

      driver.manage.timeouts.implicit_wait = 6
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

      driver.manage.timeouts.implicit_wait = 3
      driver.manage.timeouts.implicit_wait = 0
      add.click

      driver.find_elements(:class_name => "redbox").should be_empty
    end
  end

  context "page loads" do
    after { driver.manage.timeouts.page_load = -1 }

    compliant_on :browser => :firefox do
      it "should be able to set the page load timeout" do
        driver.manage.timeouts.page_load = 2
        # TODO: actually test something
      end
    end
  end

end
