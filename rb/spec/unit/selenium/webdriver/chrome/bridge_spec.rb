require File.expand_path("../../spec_helper", __FILE__)


module Selenium
  module WebDriver
    module Chrome

      describe Bridge do
        let(:resp)    { {"sessionId" => "foo", "value" => @default_capabilities }}
        let(:service) { mock(Service, :start => true, :uri => "http://example.com") }
        let(:caps)    { mock(Remote::Capabilities).as_null_object    }
        let(:http)    { mock(Remote::Http::Default, :call => resp).as_null_object   }

        before do
          @default_capabilities = Remote::Capabilities.chrome.as_json

          Remote::Capabilities.stub!(:chrome).and_return(caps)
          Service.stub!(:default_service).and_return(service)
        end

        it "sets the chrome.nativeEvents capability" do
          caps.should_receive(:merge!).with('chrome.nativeEvents' => true)
          Bridge.new(:http_client => http, :native_events => true)
        end

        it "sets the chrome.switches capability" do
          caps.should_receive(:merge!).with('chrome.switches' => %w[--foo=bar])
          Bridge.new(:http_client => http, :switches => %w[--foo=bar])
        end

        it "sets the chrome.verbose capability" do
          caps.should_receive(:merge!).with('chrome.verbose' => true)
          Bridge.new(:http_client => http, :verbose => true)
        end

        it "sets the chrome.detach capability" do
          caps.should_receive(:merge!).with('chrome.detach' => true)
          Bridge.new(:http_client => http) # true by default
        end

        it "lets the user override chrome.detach" do
          caps.should_receive(:merge!).with('chrome.detach' => false)
          Bridge.new(:http_client => http, :detach => false)
        end

        it "raises an ArgumentError if switches is not an Array" do
          lambda { Bridge.new(:switches => "--foo=bar")}.should raise_error(ArgumentError)
        end

        it "uses the given profile" do
          profile = Profile.new

          profile['some_pref'] = true
          profile.add_extension(__FILE__)

          profile_data = profile.as_json

          caps.should_receive(:merge!).with(
            'chrome.profile'    => profile_data['zip'],
            'chrome.extensions' => profile_data['extensions']
          )

          Bridge.new(:http_client => http, :profile => profile)
        end
      end

    end # Chrome
  end # WebDriver
end # Selenium

