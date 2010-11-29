require File.expand_path("../../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Remote
      module Http
        describe Default do
          let(:client) {
            client = Default.new
            client.server_url = URI.parse("http://example.com")

            client
          }

          it "uses the specified timeout" do
            client.timeout = 10
            http = client.send :http

            http.open_timeout.should == 10
            http.read_timeout.should == 10
          end

          it "uses the specified proxy" do
            client.proxy = Proxy.new(:http => "http://foo:bar@proxy.org:8080")
            http = client.send :http

            http.should be_proxy
            http.proxy_address.should == "proxy.org"
            http.proxy_port.should == 8080
            http.proxy_user.should == "foo"
            http.proxy_pass.should == "bar"
          end

          it "raises an error if the proxy is not an HTTP proxy" do
            client.proxy = Proxy.new(:ftp => "ftp://example.com")
            lambda { client.send :http }.should raise_error(Error::WebDriverError)
          end
        end

      end # Http
    end # Remote
  end # WebDriver
end # Selenium

