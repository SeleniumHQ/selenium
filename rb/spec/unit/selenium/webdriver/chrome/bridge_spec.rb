require File.expand_path("../../spec_helper", __FILE__)


module Selenium
  module WebDriver
    module Chrome

      describe Bridge do
        let(:resp)    { {"sessionId" => "foo", "value" => @default_capabilities }}
        let(:service) { mock(Service, :start => true, :uri => "http://example.com") }
        let(:caps)    { {} }
        let(:http)    { mock(Remote::Http::Default, :call => resp).as_null_object   }

        before do
          @default_capabilities = Remote::Capabilities.chrome.as_json

          Remote::Capabilities.stub!(:chrome).and_return(caps)
          Service.stub!(:default_service).and_return(service)
        end

        it "sets the nativeEvents capability" do
          Bridge.new(:http_client => http, :native_events => true)

          caps['chromeOptions']['nativeEvents'].should be_true
          caps['chrome.nativeEvents'].should be_true
        end

        it "sets the args capability" do
          Bridge.new(:http_client => http, :args => %w[--foo=bar])

          caps['chromeOptions']['args'].should == %w[--foo=bar]
          caps['chrome.switches'].should == %w[--foo=bar]
        end

        it "sets the proxy capabilitiy" do
          proxy = Proxy.new(:http => "localhost:1234")
          Bridge.new(:http_client => http, :proxy => proxy)

          caps['proxy'].should == proxy
        end

        it "sets the chrome.verbose capability" do
          Bridge.new(:http_client => http, :verbose => true)

          caps['chromeOptions']['verbose'].should be_true
          caps['chrome.verbose'].should be_true
        end

        it "sets the chrome.detach capability" do
          Bridge.new(:http_client => http) # true by default

          caps['chromeOptions']['detach'].should be_true
          caps['chrome.detach'].should be_true
        end

        it "lets the user override chrome.detach" do
          Bridge.new(:http_client => http, :detach => false)

          caps['chromeOptions']['detach'].should be_false
          caps['chrome.detach'].should be_false
        end

        it "lets the user override chrome.noWebsiteTestingDefaults" do
          Bridge.new(:http_client => http, :no_website_testing_defaults => true)

          caps['chromeOptions']['noWebsiteTestingDefaults'].should be_true
          caps['chrome.noWebsiteTestingDefaults'].should be_true
        end

        it "uses the user-provided server URL if given" do
          Service.should_not_receive(:default_service)
          http.should_receive(:server_url=).with(URI.parse("http://example.com"))

          Bridge.new(:http_client => http, :url => "http://example.com")
        end

        it "raises an ArgumentError if args is not an Array" do
          lambda { Bridge.new(:args => "--foo=bar")}.should raise_error(ArgumentError)
        end

        it "uses the given profile" do
          profile = Profile.new

          profile['some_pref'] = true
          profile.add_extension(__FILE__)

          Bridge.new(:http_client => http, :profile => profile)

          profile_data = profile.as_json
          caps['chromeOptions']['profile'].should == profile_data['zip']
          caps['chromeOptions']['extensions'].should == profile_data['extensions']

          caps['chrome.profile'].should == profile_data['zip']
          caps['chrome.extensions'].should == profile_data['extensions']
        end
      end

    end # Chrome
  end # WebDriver
end # Selenium

