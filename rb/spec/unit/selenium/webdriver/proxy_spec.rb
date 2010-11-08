require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe Proxy do
      let :proxy_settings do
        {
          :ftp         => "mythicalftpproxy:21",
          :http        => "mythicalproxy:80",
          :no_proxy    => "noproxy",
          :ssl         => "mythicalsslproxy",
        }
      end

      it "raises ArgumentError if passed invalid options" do
        lambda { Proxy.new(:invalid_options => 'invalid') }.should raise_error(ArgumentError)
      end

      it "raises ArgumentError if passed an invalid proxy type" do
        lambda { Proxy.new(:type => :invalid) }.should raise_error(ArgumentError)
      end

      it "raises ArgumentError if the proxy type is changed" do
        proxy = Proxy.new(:type => :manual)
        lambda { proxy.type = :pac }.should raise_error(ArgumentError)
      end

      it "should allow valid options for a manual proxy" do
        proxy = Proxy.new(proxy_settings)

        proxy.ftp.should      == proxy_settings[:ftp]
        proxy.http.should     == proxy_settings[:http]
        proxy.no_proxy.should == proxy_settings[:no_proxy]
        proxy.ssl.should      == proxy_settings[:ssl]
      end

      it "should return a hash of the json properties to serialize" do
        proxy_json = Proxy.new(proxy_settings).as_json

        proxy_json['proxyType'].should    == "MANUAL"
        proxy_json['ftpProxy'].should     == proxy_settings[:ftp]
        proxy_json['httpProxy'].should    == proxy_settings[:http]
        proxy_json['noProxy'].should      == proxy_settings[:no_proxy]
        proxy_json['sslProxy'].should     == proxy_settings[:ssl]
      end

      it "should configure a PAC proxy" do
        proxy_json = Proxy.new(:pac => "http://example.com/foo.pac").as_json

        proxy_json['proxyType'].should == "PAC"
        proxy_json['proxyAutoconfigUrl'].should == "http://example.com/foo.pac"
      end

      it "should configure an auto-detected proxy" do
        proxy_json = Proxy.new(:auto_detect => true).as_json

        proxy_json['proxyType'].should == "AUTODETECT"
        proxy_json['autodetect'].should be_true
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
        proxy = Proxy.new(proxy_settings)
        proxy.to_json.should be_kind_of(String)
      end

      it "can be serialized and deserialized" do
        proxy = Proxy.new(proxy_settings)
        other = Proxy.json_create(proxy.as_json)

        proxy.should == other
      end

    end
  end
end
