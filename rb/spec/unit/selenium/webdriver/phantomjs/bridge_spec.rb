require File.expand_path("../../spec_helper", __FILE__)


module Selenium
  module WebDriver
    module PhantomJS
      describe Bridge do

        let(:resp)    { {"sessionId" => "foo", "value" => Remote::Capabilities.phantomjs.as_json }}
        let(:service) { double(Service, :start => true, :uri => "http://example.com") }
        let(:http)    { double(Remote::Http::Default, :call => resp).as_null_object   }

        before do
          Service.stub(:default_service).and_return(service)
        end

        it 'starts the server with the given arguments' do
          service.should_receive(:start).with(%w[--foo --bar])
          Bridge.new(:http_client => http, :args => %w[--foo --bar])
        end

        it 'reads server arguments from desired capabilities if not given directly' do
          service.should_receive(:start).with(%w[--foo --bar])

          caps = Remote::Capabilities.phantomjs
          caps['phantomjs.cli.args'] = %w[--foo --bar]

          Bridge.new(:http_client => http, :desired_capabilities => caps)
        end

        it 'takes desired capabilities' do
          custom_caps = Remote::Capabilities.new(:browser_name => 'foo')

          http.should_receive(:call).with do |verb, post, payload|
            payload[:desiredCapabilities].should == custom_caps
            resp
          end

          Bridge.new(:http_client => http, :desired_capabilities => custom_caps)
        end

        it 'lets direct arguments take presedence over capabilities' do
          service.should_receive(:start).with(%w[--foo --bar])

          caps = Remote::Capabilities.phantomjs
          caps['phantomjs.cli.args'] = %w[--baz]

          Bridge.new(:http_client => http, :desired_capabilities => caps, :args => %w[--foo --bar])
        end

      end
    end # PhantomJS
  end # WebDriver
end # Selenium

