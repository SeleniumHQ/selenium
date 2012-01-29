require File.expand_path("../spec_helper", __FILE__)

module Selenium::WebDriver::DriverExtensions
  describe HasBrowserConnection do

    compliant_on :browser => nil do
      it "can set the browser offline and online" do
        driver.navigate.to url_for("html5Page.html")
        driver.should be_online

        driver.online = false
        wait.until { not driver.online? }

        driver.online = true
        wait.until { driver.online? }
      end
    end

  end
end
