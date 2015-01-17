require File.expand_path("../spec_helper", __FILE__)

module Selenium::WebDriver::DriverExtensions
  describe HasNetworkConnection do
    compliant_on :browser => :android do
      it "can return the network connection type" do
        expect(driver.network_connection_type).to eq :all
      end

      it "can set the network connection type" do
        expect { driver.network_connection_type = :airplane_mode }.to change { driver.network_connection_type }.from(:all).to(:airplane_mode)
      end
    end
  end
end
