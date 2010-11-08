module Selenium
  module WebDriver
    module Remote
      describe Capabilities do

        it "should default to no proxy" do
          Capabilities.new.proxy.should be_nil
        end

        it "should set the given proxy" do
          proxy = Proxy.new
          capabilities = Capabilities.new(:proxy => proxy)

          capabilities.proxy.should == proxy
        end

        it "should accept a Hash" do
          capabilities = Capabilities.new(:proxy => {:http => "foo:123"})
          capabilities.proxy.http.should == "foo:123"
        end

        it "should return a hash of the json properties to serialize" do
          capabilities_hash = Capabilities.new(:proxy => {:http => "some value"}).as_json
          proxy_hash = capabilities_hash["proxy"]

          capabilities_hash["proxy"].should be_kind_of(Hash)
          proxy_hash['httpProxy'].should == "some value"
          proxy_hash['proxyType'].should == "MANUAL"
        end

        it "should not contain proxy hash when no proxy settings" do
          capabilities_hash = Capabilities.new.as_json
          capabilities_hash.should_not have_key("proxy")
        end

        it "can be serialized and deserialized to JSON" do
          caps = Capabilities.new(:browser_name => "firefox")
          caps.should == Capabilities.json_create(caps.as_json)
        end
      end
    end
  end
end