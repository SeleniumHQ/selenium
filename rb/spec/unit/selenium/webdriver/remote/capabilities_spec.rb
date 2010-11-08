module Selenium
  module WebDriver
    module Remote
      describe Capabilities do
        it "no proxy setting" do
          Capabilities.new.proxy.is_a?(Proxy).should be_true
        end
        it "proxy object is created" do
          capabilities = Capabilities.new(:proxy => {})
          capabilities.proxy.is_a?(Proxy).should be_true
        end

        it "should return a hash of the json properties to serialize" do
          capabilities = Capabilities.new(:proxy => {:http => "some value"})
          capabilities_hash = capabilities.as_json
          capabilities_hash["proxy"].is_a?(Hash).should be_true
        end

        it "should not contain proxy hash when no proxy settings" do
          capabilities = Capabilities.new
          capabilities_hash = capabilities.as_json
          capabilities_hash.has_key?("proxy").should be_false
        end
      end
    end
  end
end