module Selenium
  module WebDriver
    module Remote
      describe Proxy do
        before do
          @proxy_settings = {
              :type        => :manual,
              :ftp         => "mythicalftpproxy:21",
              :http        => "mythicalproxy:80",
              :no_proxy    => "noproxy",
              :pac         => "mythicalpacurl",
              :ssl         => "mythicalsslproxy",
              :auto_detect => true
          }
        end

        it "raises ArgumentError if passed invalid options" do
          lambda { Proxy.new(:invalid_options => 'invalid') }.should raise_error(ArgumentError)
        end

        it "raises ArgumentError if passed an invalid proxy type" do
          lambda { Proxy.new(:type => :invalid) }.should raise_error(ArgumentError)
        end

        it "should allow valid options" do
          proxy = Proxy.new(@proxy_settings.clone)

          proxy.type.should == @proxy_settings[:type]
          proxy.ftp.should == @proxy_settings[:ftp]
          proxy.http.should == @proxy_settings[:http]
          proxy.no_proxy.should == @proxy_settings[:no_proxy]
          proxy.pac.should == @proxy_settings[:pac]
          proxy.ssl.should == @proxy_settings[:ssl]
          proxy.auto_detect.should == @proxy_settings[:auto_detect]
        end

        it "should return a hash of the json properties to serialize" do
          proxy = Proxy.new(@proxy_settings.clone)
          proxy_json = proxy.as_json

          proxy_json['proxyType'].should == @proxy_settings[:type].to_s.upcase
          proxy_json['ftpProxy'].should == @proxy_settings[:ftp]
          proxy_json['httpProxy'].should == @proxy_settings[:http]
          proxy_json['noProxy'].should == @proxy_settings[:no_proxy]
          proxy_json['proxyAutoconfigUrl'].should == @proxy_settings[:pac]
          proxy_json['sslProxy'].should == @proxy_settings[:ssl]
          proxy_json['autodetect'].should == @proxy_settings[:auto_detect]
        end

        it "should only add settings that are not nil" do
          settings = {:type => :manual, :http => "http proxy"}

          proxy = Proxy.new(settings)
          proxy_json = proxy.as_json

          proxy_json.delete('proxyType').should == settings[:type].to_s.upcase
          proxy_json.delete('httpProxy').should == settings[:http]

          proxy_json.should be_empty
        end

        it "returns a JSON string" do
          proxy = Proxy.new(@proxy_settings)
          proxy.to_json.should be_kind_of(String)
        end

      end
    end
  end
end