require File.expand_path("../../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Remote
      module Http
        describe Default do
          after { Default.timeout = nil }

          it "uses the timeout set on the class" do
            Default.timeout = 10

            http = Default.new(URI.parse("http://example.com")).send :http
            http.open_timeout.should == 10
            http.read_timeout.should == 10
          end
        end

      end # Http
    end # Remote
  end # WebDriver
end # Selenium

