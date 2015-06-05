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

require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe Proxy do
      let :proxy_settings do # manual proxy settings
        {
          :ftp            => "mythicalftpproxy:21",
          :http           => "mythicalproxy:80",
          :no_proxy       => "noproxy",
          :ssl            => "mythicalsslproxy",
          :socks          => "mythicalsocksproxy:65555",
          :socks_username => "test",
          :socks_password => "test",
        }
      end

      let :pac_proxy_settings do
        {
          :pac         => "http://example.com/foo.pac",
        }
      end

      it "raises ArgumentError if passed invalid options" do
        lambda { Proxy.new(:invalid_options => 'invalid') }.should raise_error(ArgumentError)
      end

      it "raises ArgumentError if passed an invalid proxy type" do
        lambda { Proxy.new(:type => :invalid) }.should raise_error(ArgumentError)
      end

      it "raises ArgumentError if the proxy type is changed" do
        proxy = Proxy.new(:type => :direct)
        lambda { proxy.type = :system }.should raise_error(ArgumentError)
      end

      it "should allow valid options for a manual proxy" do
        proxy = Proxy.new(proxy_settings)

        proxy.ftp.should            == proxy_settings[:ftp]
        proxy.http.should           == proxy_settings[:http]
        proxy.no_proxy.should       == proxy_settings[:no_proxy]
        proxy.ssl.should            == proxy_settings[:ssl]
        proxy.socks.should          == proxy_settings[:socks]
        proxy.socks_username.should == proxy_settings[:socks_username]
        proxy.socks_password.should == proxy_settings[:socks_password]
      end

      it "should return a hash of the json properties to serialize" do
        proxy_json = Proxy.new(proxy_settings).as_json

        proxy_json['proxyType'].should     == "MANUAL"
        proxy_json['ftpProxy'].should      == proxy_settings[:ftp]
        proxy_json['httpProxy'].should     == proxy_settings[:http]
        proxy_json['noProxy'].should       == proxy_settings[:no_proxy]
        proxy_json['sslProxy'].should      == proxy_settings[:ssl]
        proxy_json['socksProxy'].should    == proxy_settings[:socks]
        proxy_json['socksUsername'].should == proxy_settings[:socks_username]
        proxy_json['socksPassword'].should == proxy_settings[:socks_password]
      end

      it "should configure a PAC proxy" do
        proxy_json = Proxy.new(pac_proxy_settings).as_json

        proxy_json['proxyType'].should == "PAC"
        proxy_json['proxyAutoconfigUrl'].should == pac_proxy_settings[:pac]
      end

      it "should configure an auto-detected proxy" do
        proxy_json = Proxy.new(:auto_detect => true).as_json

        proxy_json['proxyType'].should == "AUTODETECT"
        proxy_json['autodetect'].should be true
      end

      it "should only add settings that are not nil" do
        settings = {:type => :manual, :http => "http proxy"}

        proxy = Proxy.new(settings)
        proxy_json = proxy.as_json

        proxy_json.delete('proxyType').should == settings[:type].to_s.upcase
        proxy_json.delete('httpProxy').should == settings[:http]

        proxy_json.should be_empty
      end

      it "returns a JSON string" do
        proxy = Proxy.new(proxy_settings)
        proxy.to_json.should be_kind_of(String)
      end

      it "can be serialized and deserialized" do
        proxy = Proxy.new(proxy_settings)
        other = Proxy.json_create(proxy.as_json)

        proxy.should == other
      end

      it 'deserializes to nil if proxyType is UNSPECIFIED' do
        Proxy.json_create('proxyType' => 'UNSPECIFIED').should be_nil
      end
    end

  end
end
