require File.expand_path("../../spec_helper", __FILE__)


module Selenium
  module WebDriver
    module Android
      describe Android do
        let(:default_url) { URI.parse(Android::Bridge::DEFAULT_URL) }
        let(:resp)        { {"sessionId" => "foo", "value" => Remote::Capabilities.android.as_json }}
        let(:http)        { double(Remote::Http::Default, :call => resp).as_null_object   }

        it "uses the default Android driver URL" do
          http.should_receive(:server_url=).with default_url
          Bridge.new(:http_client => http)
        end

        it "uses the user-provided URL" do
          http.should_receive(:server_url=).with URI.parse("http://example.com")
          Bridge.new(:http_client => http, :url => "http://example.com")
        end

        it "uses the default HTTP client when none is specified" do
          Remote::Http::Default.should_receive(:new).and_return http
          Bridge.new
        end

        it 'takes desired capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps['foo'] = 'bar'

          http.should_receive(:call).with do |_, _, payload|
            payload[:desiredCapabilities]['foo'].should == 'bar'
            resp
          end

          Bridge.new(:http_client => http, :desired_capabilities => custom_caps)
        end
      end

    end # IPhone
  end # WebDriver
end # Selenium

