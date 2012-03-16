require File.expand_path("../../spec_helper", __FILE__)


module Selenium
  module WebDriver
    module IE

      describe Bridge do
        let(:resp)    { {"sessionId" => "foo", "value" => @default_capabilities }}
        let(:server)  { mock(Server, :start => 5555, :uri => "http://example.com") }
        let(:caps)    { {} }
        let(:http)    { mock(Remote::Http::Default, :call => resp).as_null_object   }
        
        before do
          @default_capabilities = Remote::Capabilities.internet_explorer
          Remote::Capabilities.stub!(:internet_explorer => caps)
        end

        it "raises ArgumentError if passed invalid options" do
          lambda { Bridge.new(:foo => 'bar') }.should raise_error(ArgumentError)
        end
        
        it "accepts the :introduce_flakiness_by_ignoring_security_domains option" do
          Bridge.new(:introduce_flakiness_by_ignoring_security_domains => true)
          caps['ignoreProtectedModeSettings'].should be_true
        end
        
      end

    end
  end
end
