require File.expand_path("../spec_helper", __FILE__)

describe "WebDriver::TargetLocator" do
  let(:wait) { Selenium::WebDriver::Wait.new }

  it "should switch to a frame" do
    driver.navigate.to url_for("iframes.html")
    driver.switch_to.frame("iframe1")

    # TODO: expectations?
  end

  it "should switch to a frame by Element" do
    driver.navigate.to url_for("iframes.html")

    iframe = driver.find_element(:tag_name => "iframe")
    driver.switch_to.frame(iframe)

    # TODO: expectations?
  end

  not_compliant_on :browser => :ie do
    it "should switch to a window and back when given a block" do
      driver.navigate.to url_for("xhtmlTest.html")

      driver.find_element(:link, "Open new window").click
      driver.title.should == "XHTML Test Page"

      driver.switch_to.window("result") do
        wait.until { driver.title == "We Arrive Here" }
      end

      wait.until { driver.title == "XHTML Test Page" }

      reset_driver!
    end

    it "should handle exceptions inside the block" do
      driver.navigate.to url_for("xhtmlTest.html")

      driver.find_element(:link, "Open new window").click
      driver.title.should == "XHTML Test Page"

      lambda {
        driver.switch_to.window("result") { raise "foo" }
      }.should raise_error(RuntimeError, "foo")

      driver.title.should == "XHTML Test Page"

      reset_driver!
    end
  end

  not_compliant_on :browser => :ie do
    it "should switch to a window" do
      driver.navigate.to url_for("xhtmlTest.html")

      driver.find_element(:link, "Open new window").click
      wait.until { driver.title == "XHTML Test Page" }

      driver.switch_to.window("result")
      wait.until { driver.title == "We Arrive Here" }

      reset_driver!
    end

    it "should use the original window if the block closes the popup" do
      driver.navigate.to url_for("xhtmlTest.html")

      driver.find_element(:link, "Open new window").click
      driver.title.should == "XHTML Test Page"

      driver.switch_to.window("result") do
        wait.until { driver.title == "We Arrive Here" }
        driver.close
      end

      driver.current_url.should include("xhtmlTest.html")
      driver.title.should == "XHTML Test Page"
      reset_driver!
    end
  end

  it "should switch to default content" do
    driver.navigate.to url_for("iframes.html")

    driver.switch_to.frame 0
    driver.switch_to.default_content

    driver.find_element(:id => "iframe_page_heading")
  end

  it "should find active element" do
    driver.navigate.to url_for("xhtmlTest.html")
    driver.switch_to.active_element.should be_an_instance_of(WebDriver::Element)
  end

  compliant_on :browser => [:ie, :firefox] do
    describe "alerts" do
      it "allows the user to accept an alert" do
        driver.navigate.to url_for("alerts.html")
        driver.find_element(:id => "alert").click

        driver.switch_to.alert.accept

        driver.title.should == "Testing Alerts"
      end

      it "allows the user to dismiss an alert" do
        driver.navigate.to url_for("alerts.html")
        driver.find_element(:id => "alert").click

        driver.switch_to.alert.dismiss

        driver.title.should == "Testing Alerts"
      end

      it "allows the user to set the value of a prompt" do
        driver.navigate.to url_for("alerts.html")
        driver.find_element(:id => "prompt").click

        alert = driver.switch_to.alert
        alert.send_keys "cheese"
        alert.accept

        text = driver.find_element(:id => "text").text
        text.should == "cheese"
      end

      it "allows the user to get the text of an alert" do
        driver.navigate.to url_for("alerts.html")
        driver.find_element(:id => "alert").click

        alert = driver.switch_to.alert
        text = alert.text
        alert.accept

        text.should == "cheese"
      end

      it "raises UnhandledError if no alert is present" do
        lambda { driver.switch_to.alert.dismiss }.should raise_error(
          Selenium::WebDriver::Error::UnhandledError, /alert/i)
      end

      # it "raises an UnhandledAlertError if an alert has not been dealt with" do
      #   driver.navigate.to url_for("alerts.html")
      #   driver.find_element(:id => "alert").click
      #
      #   lambda { driver.title }.should raise_error(Selenium::WebDriver::Error::UnhandledAlertError)
      #
      #   driver.title.should == "Testing Alerts"
      # end
    end
  end
end

