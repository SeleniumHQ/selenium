require File.expand_path("../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Opera

      describe Bridge do
        let(:resp)    { {"sessionId" => "foo", "value" => Remote::Capabilities.opera.as_json }}
        let(:service) { double(Service, :start => true, :uri => "http://example.com") }
        let(:http)    { double(Remote::Http::Default, :call => resp).as_null_object   }

        before do
          Service.stub(:default_service => service)
        end

        it 'takes desired capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps['foo'] = 'bar'

          expect(http).to receive(:call) do |_, _, payload|
            payload[:desiredCapabilities]['foo'].should == 'bar'
            resp
          end

          Bridge.new(:http_client => http, :desired_capabilities => custom_caps)
        end

        it 'lets direct arguments take presedence over capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps['opera.arguments'] = '--foo 1'

          expect(http).to receive(:call) do |_, _, payload|
            payload[:desiredCapabilities]['opera.arguments'].should == '--foo 2'
            resp
          end

          Bridge.new(:http_client => http, :desired_capabilities => custom_caps, :arguments => %w[--foo 2])
        end
      end

    end # Opera
  end # WebDriver
end # Selenium

