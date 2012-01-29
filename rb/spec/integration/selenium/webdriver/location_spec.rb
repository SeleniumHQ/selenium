require File.expand_path("../spec_helper", __FILE__)

module Selenium::WebDriver::DriverExtensions
  describe HasLocation do

    let(:lat) { 40.714353  }
    let(:lon) { -74.005973 }
    let(:alt) { 0.056747   }

    let(:location) {
      Selenium::WebDriver::Location.new lat, lon, alt
    }

    compliant_on :browser => [:iphone, :android] do
      it "can get and set location" do
        driver.manage.timeouts.implicit_wait = 2
        driver.navigate.to url_for("html5Page.html")

        driver.location = location
        loc = driver.location

        loc.latitude.should be_within(0.000001).of(lat)
        loc.longitude.should be_within(0.000001).of(lon)
        loc.altitude.should be_within(0.000001).of(alt)
      end
    end

  end
end
