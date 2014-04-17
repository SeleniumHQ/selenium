require File.expand_path("../../spec_helper", __FILE__)


module Selenium
  module WebDriver
    module Firefox

      describe Bridge do
        let(:launcher) { double(Launcher, :launch => nil, :url => "http://localhost:4444/wd/hub") }
        let(:resp) { {"sessionId" => "foo", "value" => @default_capabilities }}
        let(:http) { double(Remote::Http::Default, :call => resp).as_null_object   }
        let(:caps) { {} }

        before do
          @default_capabilities = Remote::Capabilities.firefox.as_json
          Remote::Capabilities.stub(:firefox).and_return(caps)
          Launcher.stub(:new).and_return(launcher)
        end

        it "sets the proxy capability" do
          proxy = Proxy.new(:http => "localhost:9090")
          caps.should_receive(:proxy=).with proxy

          Bridge.new(:http_client => http, :proxy => proxy)
        end

        it "raises ArgumentError if passed invalid options" do
          lambda { Bridge.new(:foo => 'bar') }.should raise_error(ArgumentError)
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

    end # Firefox
  end # WebDriver
end # Selenium

