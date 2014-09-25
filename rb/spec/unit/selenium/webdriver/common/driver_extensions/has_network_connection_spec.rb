require File.expand_path("../../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module DriverExtensions
      describe HasNetworkConnection do
        class FakeDriver
          include HasNetworkConnection
        end

        let(:driver) { FakeDriver.new }

        describe "#network_connection" do
          it "returns the correct connection type" do
            @bridge.stub(:getNetworkConnection) { 1 }

            expect(driver.network_connection_type).to eq :airplane_mode
          end

          it "returns an unknown connection value" do
            @bridge.stub(:getNetworkConnection) { 5 }

            expect(driver.network_connection_type).to eq 5
          end
        end

        describe "#network_connection=" do
          it "sends out the correct connection value" do
            expect(@bridge).to receive(:setNetworkConnection).with(1)

            driver.network_connection_type = :airplane_mode
          end

          it "returns an error when an invalid argument is given" do
            expect { driver.network_connection_type = :something }.
              to raise_error(ArgumentError, "Invalid connection type")
          end
        end
      end
    end
  end
end
