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

require File.expand_path('../../spec_helper', __FILE__)

module Selenium
  module WebDriver
    module Remote
      describe Capabilities do
        it 'has default capabilities for Chrome' do
          caps = Capabilities.chrome
          expect(caps.browser_name).to eq('chrome')
        end

        it 'has default capabilities for Edge' do
          caps = Capabilities.edge
          expect(caps.browser_name).to eq('MicrosoftEdge')
        end

        it 'has default capabilities for Firefox' do
          caps = Capabilities.firefox
          expect(caps.browser_name).to eq('firefox')
        end

        it 'has default capabilities for HtmlUnit' do
          caps = Capabilities.htmlunit
          expect(caps.browser_name).to eq('htmlunit')
        end

        it 'has default capabilities for Internet Explorer' do
          caps = Capabilities.internet_explorer
          expect(caps.browser_name).to eq('internet explorer')
        end

        it 'should default to no proxy' do
          expect(Capabilities.new.proxy).to be_nil
        end

        it 'can set and get standard capabilities' do
          caps = Capabilities.new

          caps.browser_name = 'foo'
          expect(caps.browser_name).to eq('foo')

          caps.native_events = true
          expect(caps.native_events).to eq(true)
        end

        it 'can set and get arbitrary capabilities' do
          caps = Capabilities.chrome
          caps['chrome'] = :foo
          expect(caps['chrome']).to eq(:foo)
        end

        it 'should set the given proxy' do
          proxy = Proxy.new
          capabilities = Capabilities.new(proxy: proxy)

          expect(capabilities.proxy).to eq(proxy)
        end

        it 'should accept a Hash' do
          capabilities = Capabilities.new(proxy: {http: 'foo:123'})
          expect(capabilities.proxy.http).to eq('foo:123')
        end

        it 'should return a hash of the json properties to serialize' do
          capabilities_hash = Capabilities.new(proxy: {http: 'some value'}).as_json
          proxy_hash = capabilities_hash['proxy']

          expect(capabilities_hash['proxy']).to be_kind_of(Hash)
          expect(proxy_hash['httpProxy']).to eq('some value')
          expect(proxy_hash['proxyType']).to eq('MANUAL')
        end

        it 'should not contain proxy hash when no proxy settings' do
          capabilities_hash = Capabilities.new.as_json
          expect(capabilities_hash).not_to have_key('proxy')
        end

        it 'can merge capabilities' do
          a = Capabilities.chrome
          b = Capabilities.htmlunit
          a.merge!(b)

          expect(a.browser_name).to eq('htmlunit')
          expect(a.javascript_enabled).to be false
        end

        it 'can be serialized and deserialized to JSON' do
          caps = Capabilities.new(browser_name: 'firefox', custom_capability: true)
          expect(caps).to eq(Capabilities.json_create(caps.as_json))
        end

        it 'does not camel case the :firefox_binary capability' do
          expect(Capabilities.new(firefox_binary: '/foo/bar').as_json).to include('firefox_binary')
        end
      end
    end # Remote
  end # WebDriver
end # Selenium
