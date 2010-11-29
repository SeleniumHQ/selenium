require File.expand_path("../../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Remote
      module Http
        describe Default do
          it "uses the timeout set on the class" do
            client = Default.new
            client.server_url = URI.parse("http://example.com")

            client.timeout = 10
            http = client.send :http

            http.open_timeout.should == 10
            http.read_timeout.should == 10
          end
        end

      end # Http
    end # Remote
  end # WebDriver
end # Selenium

