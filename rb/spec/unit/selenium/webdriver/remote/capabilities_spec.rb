# encoding: utf-8
#
# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

require File.expand_path("../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Remote
      describe Capabilities do

        it "has default capabilities for Android" do
          caps = Capabilities.android
          caps.browser_name.should == "android"
          caps.platform.should == :android
        end

        it "has default capabilities for Chrome" do
          caps = Capabilities.chrome
          caps.browser_name.should == "chrome"
        end

        it "has default capabilities for Firefox" do
          caps = Capabilities.firefox
          caps.browser_name.should == "firefox"
        end

        it "has default capabilities for HtmlUnit" do
          caps = Capabilities.htmlunit
          caps.browser_name.should == "htmlunit"
        end

        it "has default capabilities for Internet Explorer" do
          caps = Capabilities.internet_explorer
          caps.browser_name.should == "internet explorer"
        end

        it "has default capabilities for iPhone" do
          caps = Capabilities.iphone
          caps.browser_name.should == "iPhone"
        end

        it "has default capabilities for iPad" do
          caps = Capabilities.ipad
          caps.browser_name.should == "iPad"
        end

        it "should default to no proxy" do
          Capabilities.new.proxy.should be_nil
        end

        it "can set and get standard capabilities" do
          caps = Capabilities.new

          caps.browser_name = "foo"
          caps.browser_name.should == "foo"

          caps.native_events = true
          caps.native_events.should == true
        end

        it "can set and get arbitrary capabilities" do
          caps = Capabilities.chrome
          caps['chrome'] = :foo
          caps['chrome'].should == :foo
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

        it "can merge capabilities" do
          a, b = Capabilities.chrome, Capabilities.htmlunit
          a.merge!(b)

          a.browser_name.should == "htmlunit"
          a.javascript_enabled.should be false
        end

        it "can be serialized and deserialized to JSON" do
          caps = Capabilities.new(:browser_name => "firefox", :custom_capability => true)
          caps.should == Capabilities.json_create(caps.as_json)
        end

        it 'does not camel case the :firefox_binary capability' do
          Capabilities.new(:firefox_binary => "/foo/bar").as_json.should include('firefox_binary')
        end
      end
    end
  end
end
