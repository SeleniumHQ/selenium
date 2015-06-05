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
    module Chrome

      describe Bridge do
        let(:resp)    { {"sessionId" => "foo", "value" => @default_capabilities }}
        let(:service) { double(Service, :start => true, :uri => "http://example.com") }
        let(:caps)    { {} }
        let(:http)    { double(Remote::Http::Default, :call => resp).as_null_object   }

        before do
          @default_capabilities = Remote::Capabilities.chrome.as_json

          Remote::Capabilities.stub(:chrome).and_return(caps)
          Service.stub(:default_service).and_return(service)
        end

        it "sets the nativeEvents capability" do
          Bridge.new(:http_client => http, :native_events => true)

          caps['chromeOptions']['nativeEvents'].should be true
          caps['chrome.nativeEvents'].should be true
        end

        it "sets the args capability" do
          Bridge.new(:http_client => http, :args => %w[--foo=bar])

          caps['chromeOptions']['args'].should == %w[--foo=bar]
          caps['chrome.switches'].should == %w[--foo=bar]
        end

        it "sets the proxy capabilitiy" do
          proxy = Proxy.new(:http => "localhost:1234")
          Bridge.new(:http_client => http, :proxy => proxy)

          caps['proxy'].should == proxy
        end

        it "sets the chrome.verbose capability" do
          Bridge.new(:http_client => http, :verbose => true)

          caps['chromeOptions']['verbose'].should be true
          caps['chrome.verbose'].should be true
        end

        it "sets the chrome.detach capability" do
          Bridge.new(:http_client => http) # true by default

          caps['chromeOptions']['detach'].should be true
          caps['chrome.detach'].should be true
        end

        it "sets the prefs capability" do
          Bridge.new(:http_client => http, :prefs => {:foo => "bar"})

          caps['chromeOptions']['prefs'].should == {:foo => "bar"}
          caps['chrome.prefs'].should == {:foo => "bar"}
        end

        it "lets the user override chrome.detach" do
          Bridge.new(:http_client => http, :detach => false)

          caps['chromeOptions']['detach'].should be false
          caps['chrome.detach'].should be false
        end

        it "lets the user override chrome.noWebsiteTestingDefaults" do
          Bridge.new(:http_client => http, :no_website_testing_defaults => true)

          caps['chromeOptions']['noWebsiteTestingDefaults'].should be true
          caps['chrome.noWebsiteTestingDefaults'].should be true
        end

        it "uses the user-provided server URL if given" do
          Service.should_not_receive(:default_service)
          http.should_receive(:server_url=).with(URI.parse("http://example.com"))

          Bridge.new(:http_client => http, :url => "http://example.com")
        end

        it "raises an ArgumentError if args is not an Array" do
          lambda { Bridge.new(:args => "--foo=bar")}.should raise_error(ArgumentError)
        end

        it "uses the given profile" do
          profile = Profile.new

          profile['some_pref'] = true
          profile.add_extension(__FILE__)

          Bridge.new(:http_client => http, :profile => profile)

          profile_data = profile.as_json
          caps['chromeOptions']['profile'].should == profile_data['zip']
          caps['chromeOptions']['extensions'].should == profile_data['extensions']

          caps['chrome.profile'].should == profile_data['zip']
          caps['chrome.extensions'].should == profile_data['extensions']
        end

        it 'takes desired capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps['chromeOptions'] = {'foo' => 'bar'}

          expect(http).to receive(:call) do |_, _, payload|
            payload[:desiredCapabilities]['chromeOptions'].should include('foo' => 'bar')
            resp
          end

          Bridge.new(:http_client => http, :desired_capabilities => custom_caps)
        end

        it 'lets direct arguments take presedence over capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps['chromeOptions'] = {'args' => %w[foo bar]}

          expect(http).to receive(:call) do |_, _, payload|
            payload[:desiredCapabilities]['chromeOptions']['args'].should == ['baz']
            resp
          end

          Bridge.new(:http_client => http, :desired_capabilities => custom_caps, :args => %w[baz])
        end

        it 'accepts :service_log_path' do
          Service.should_receive(:default_service).with("--log-path=/foo/bar")
          Bridge.new(:http_client => http, :service_log_path => "/foo/bar")
        end
      end

    end # Chrome
  end # WebDriver
end # Selenium

