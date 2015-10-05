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

require_relative 'spec_helper'

describe Selenium::Client::Base do

  class BaseClient
    include Selenium::Client::Base
  end

  describe "#initialize with hash" do
    it "sets the host" do
      client = BaseClient.new :host => "the.host.com"
      expect(client.host).to eq("the.host.com")
    end

    it "sets the port" do
      client = BaseClient.new :port => 4000
      expect(client.port).to eq(4000)
    end

    it "sets the port as a string" do
      client = BaseClient.new :port => "4000"
      expect(client.port).to eq(4000)
    end

    it "sets the browser string" do
      client = BaseClient.new :browser => "*safari"
      expect(client.browser_string).to eq("*safari")
    end

    it "sets the browser url" do
      client = BaseClient.new :url => "http://ph7spot.com"
      expect(client.browser_url).to eq("http://ph7spot.com")
    end

    it "sets the default timeout" do
      client = BaseClient.new :timeout_in_seconds => 24
      expect(client.default_timeout_in_seconds).to eq(24)
    end

    it "sets the default javascript framework " do
      client = BaseClient.new :javascript_framework => :jquery
      expect(client.default_javascript_framework).to eq(:jquery)
    end

    it "sets the default javascript framework to prototype when not explicitely set" do
      expect(BaseClient.new.default_javascript_framework).to eq(:prototype)
    end

    it "sets highlight_located_element_by_default" do
      client = BaseClient.new :highlight_located_element => true

      expect(client.highlight_located_element_by_default).to be true
    end

    it "sets highlight_located_element_by_default to false by default" do
      client = BaseClient.new :host => :a_host
      expect(client.highlight_located_element_by_default).to be false
    end
  end

  describe "#initialize" do
    it "sets the default timeout to 5 minutes when not explicitely set" do
      expect(BaseClient.new.default_timeout_in_seconds).to eq(5 * 60)
    end

    it "sets default_timeout_in_seconds to the client driver default timeout in seconds" do
      client = BaseClient.new :host, 1234, :browser, :url, 24
      expect(client.default_timeout_in_seconds).to eq(24)
    end

    it "sets default_timeout_in_seconds to 5 minutes by default" do
      client = BaseClient.new :host, 24, :browser, :url
      expect(client.default_timeout_in_seconds).to eq(5 * 60)
    end

    it "sets highlight_located_element_by_default to false by default" do
      expect(BaseClient.new.highlight_located_element_by_default).to be false
    end
  end

  describe "#start_new_browser_session" do
    it "executes a getNewBrowserSession command with the browser string an url" do
      client = BaseClient.new :host, 24, :the_browser, :the_url

      allow(client).to receive(:remote_control_command)
      expect(client).to receive(:string_command).with("getNewBrowserSession", [:the_browser, :the_url, "", ""])

      client.start_new_browser_session
    end

    it "submits the javascript extension when previously defined" do
      client = BaseClient.new :host, 24, :the_browser, :the_url
      client.javascript_extension = :the_javascript_extension

      allow(client).to receive(:remote_control_command)
      expect(client).to receive(:string_command).with("getNewBrowserSession", [:the_browser, :the_url, :the_javascript_extension, ""])

      client.start_new_browser_session
    end

    it "submits an option when provided" do
      client = BaseClient.new :host, 24, :the_browser, :the_url
      client.javascript_extension = :the_javascript_extension

      allow(client).to receive(:remote_control_command)
      expect(client).to receive(:string_command).with("getNewBrowserSession", [:the_browser, :the_url, :the_javascript_extension, "captureNetworkTraffic=true"])

      client.start_new_browser_session(:captureNetworkTraffic => true)
    end

    it "submits multiple options when provided" do
      client = BaseClient.new :host, 24, :the_browser, :the_url
      client.javascript_extension = :the_javascript_extension

      allow(client).to receive(:remote_control_command)
      expect(client).to receive(:string_command).with("getNewBrowserSession", [:the_browser, :the_url, :the_javascript_extension, "captureNetworkTraffic=true;quack=false"])

      client.start_new_browser_session(:captureNetworkTraffic => true, :quack => false)
    end

    it "sets the current sessionId with getNewBrowserSession response" do
      client = BaseClient.new :host, 24, :the_browser, :the_url

      allow(client).to receive(:remote_control_command)
      expect(client).to receive(:string_command).with("getNewBrowserSession", instance_of(Array)).
        and_return("the new session id")

      client.start_new_browser_session

      expect(client.session_id).to eq("the new session id")
    end

    it "sets remote control timeout to the driver default timeout" do
      client = BaseClient.new :host, 24, :the_browser, :the_url, 24

      expect(client).to receive(:string_command).with("getNewBrowserSession", instance_of(Array))
      expect(client).to receive(:remote_control_timeout_in_seconds=).with(24)

      client.start_new_browser_session
    end

    it "sets up auto-higlight of located element when option is set" do
      client = BaseClient.new :highlight_located_element => true

      allow(client).to receive(:remote_control_command)
      expect(client).to receive(:highlight_located_element=).with(true)

      client.start_new_browser_session
    end

    it "does not set up auto-higlight of located element when option is not set" do
      client = BaseClient.new :highlight_located_element => false

      allow(client).to receive(:remote_control_command)
      expect(client).not_to receive(:highlight_located_element=)

      client.start_new_browser_session
    end
  end

  describe "session_started?" do
    it "returns false when no session has been started" do
      client = BaseClient.new :host, 24, :browser, :url
      expect(client.session_started?).to be_falsey
    end

    it "returns true when session has been started" do
      client = BaseClient.new :host, 24, :browser, :url

      allow(client).to receive(:string_command).and_return("A Session Id")
      allow(client).to receive(:remote_control_command)

      client.start_new_browser_session

      expect(client.session_started?).to be true
    end

    it "returns false when session has been stopped" do
      client = BaseClient.new :host, 24, :browser, :url

      allow(client).to receive(:string_command).and_return("A Session Id")
      allow(client).to receive(:remote_control_command)

      client.start_new_browser_session
      client.stop

      expect(client.session_started?).to be false
    end
  end

  describe "chrome_backend?" do
    it "returns true when the browser string is *firefox" do
      client = BaseClient.new :host, 24, "*firefox", :url
      expect(client.chrome_backend?).to be true
    end

    it "returns false when the browser string is *iexplore" do
      client = BaseClient.new :host, 24, "*iexplore", :url
      expect(client.chrome_backend?).to be false
    end

    it "returns false when the browser string is *safari" do
      client = BaseClient.new :host, 24, "*safari", :url
      expect(client.chrome_backend?).to be false
    end

    it "returns true when the browser string is *chrome" do
      client = BaseClient.new :host, 24, "*chrome", :url
      expect(client.chrome_backend?).to be true
    end

    it "returns true when the browser string is *firefox2" do
      client = BaseClient.new :host, 24, "*firefox2", :url
      expect(client.chrome_backend?).to be true
    end

    it "returns true when the browser string is *firefox3" do
      client = BaseClient.new :host, 24, "*firefox3", :url
      expect(client.chrome_backend?).to be true
    end

    it "returns false when the browser string is *firefoxproxy" do
      client = BaseClient.new :host, 24, "*firefoxproxy", :url
      expect(client.chrome_backend?).to be false
    end

    it "returns false when the browser string is *pifirefox" do
      client = BaseClient.new :host, 24, "*pifirefox", :url
      expect(client.chrome_backend?).to be false
    end
  end


end
