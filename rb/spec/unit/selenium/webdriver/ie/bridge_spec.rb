require File.expand_path("../../spec_helper", __FILE__)


module Selenium
  module WebDriver
    module IE

      describe Bridge do
        let(:resp)    { {"sessionId" => "foo", "value" => @default_capabilities.as_json }}
        let(:server)  { double(Server, :start => 5555, :uri => "http://example.com") }
        let(:caps)    { {} }
        let(:http)    { double(Remote::Http::Default, :call => resp).as_null_object   }

        before do
          Server.stub(:get => server)
          @default_capabilities = Remote::Capabilities.internet_explorer
          Remote::Capabilities.stub(:internet_explorer => caps)
        end

        it "raises ArgumentError if passed invalid options" do
          lambda { Bridge.new(:foo => 'bar') }.should raise_error(ArgumentError)
        end

        it "accepts the :introduce_flakiness_by_ignoring_security_domains option" do
          Bridge.new(
            :introduce_flakiness_by_ignoring_security_domains => true,
            :http_client => http
          )

          caps['ignoreProtectedModeSettings'].should be true
        end

        it "has native events enabled by default" do
          Bridge.new(:http_client => http)

          caps['nativeEvents'].should be true
        end

        it "can disable native events" do
          Bridge.new(
            :native_events => false,
            :http_client => http
          )

          caps['nativeEvents'].should be false
        end

        it 'sets the server log level and log file' do
          server.should_receive(:log_level=).with :trace
          server.should_receive(:log_file=).with '/foo/bar'

          Bridge.new(
            :log_level   => :trace,
            :log_file    => '/foo/bar',
            :http_client => http
          )
        end

        it 'should be able to set implementation' do
          Server.should_receive(:get).with(:implementation => :vendor).and_return(server)

          Bridge.new(
            :implementation => :vendor,
            :http_client    => http
          )
        end

        it 'takes desired capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps['ignoreProtectedModeSettings'] = true

          expect(http).to receive(:call) do |_, _, payload|
            payload[:desiredCapabilities]['ignoreProtectedModeSettings'].should be true
            resp
          end

          Bridge.new(:http_client => http, :desired_capabilities => custom_caps)
        end

        it 'can override desired capabilities through direct arguments' do
          custom_caps = Remote::Capabilities.new
          custom_caps['ignoreProtectedModeSettings'] = false

          expect(http).to receive(:call) do |_, _, payload|
            payload[:desiredCapabilities]['ignoreProtectedModeSettings'].should be true
            resp
          end

          Bridge.new(
            :http_client => http,
            :desired_capabilities => custom_caps,
            :introduce_flakiness_by_ignoring_security_domains => true
          )
        end

      end

    end
  end
end
