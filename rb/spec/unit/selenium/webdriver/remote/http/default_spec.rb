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

            http.address.should == "example.com"
          end

          it "raises an error if the proxy is not an HTTP proxy" do
            client.proxy = Proxy.new(:ftp => "ftp://example.com")
            lambda { client.send :http }.should raise_error(Error::WebDriverError)
          end

          ["http_proxy", "HTTP_PROXY"].each { |proxy_var|
            it "honors the #{proxy_var} environment varable" do
              with_env(proxy_var => "http://proxy.org:8080") do
                http = client.send :http

                http.should be_proxy
                http.proxy_address.should == "proxy.org"
                http.proxy_port.should == 8080
              end
            end

            it "handles #{proxy_var} without http://" do
              with_env(proxy_var => "proxy.org:8080") do
                http = client.send :http

                http.should be_proxy
                http.proxy_address.should == "proxy.org"
                http.proxy_port.should == 8080
              end
            end
          }

          ["no_proxy", "NO_PROXY"].each do |no_proxy_var|
            it "honors the #{no_proxy_var} environment variable when matching" do
              with_env("HTTP_PROXY" => "proxy.org:8080", no_proxy_var => "example.com") do
                http = client.send :http
                http.should_not be_proxy
              end
            end

            it "ignores the #{no_proxy_var} environment variable when not matching" do
              with_env("HTTP_PROXY" => "proxy.org:8080", no_proxy_var => "foo.com") do
                http = client.send :http

                http.should be_proxy
                http.proxy_address.should == "proxy.org"
                http.proxy_port.should == 8080
              end
            end

            it "understands a comma separated list of domains in #{no_proxy_var}" do
              with_env("HTTP_PROXY" => "proxy.org:8080", no_proxy_var => "example.com,foo.com") do
                http = client.send :http
                http.should_not be_proxy
              end
            end

            it "understands an asterisk in #{no_proxy_var}" do
              with_env("HTTP_PROXY" => "proxy.org:8080", no_proxy_var => "*") do
                http = client.send :http
                http.should_not be_proxy
              end
            end

            it "understands subnetting in #{no_proxy_var}" do
              with_env("HTTP_PROXY" => "proxy.org:8080", no_proxy_var => "localhost,127.0.0.0/8") do
                client.server_url = URI.parse("http://127.0.0.1:4444/wd/hub")

                http = client.send :http
                http.should_not be_proxy
              end
            end
          end

          it "raises a sane error if a proxy is refusing connections" do
            with_env("http_proxy" => "http://localhost:1234") do
              http = client.send :http
              http.should_receive(:request).and_raise Errno::ECONNREFUSED.new("Connection refused")

              lambda {
                client.call :post, 'http://example.com/foo/bar', {}
              }.should raise_error(Errno::ECONNREFUSED, %r[using proxy: http://localhost:1234])
            end
          end

        end

      end # Http
    end # Remote
  end # WebDriver
end # Selenium

