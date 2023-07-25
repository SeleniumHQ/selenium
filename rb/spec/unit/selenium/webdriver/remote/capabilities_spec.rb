# frozen_string_literal: true

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

require File.expand_path('../spec_helper', __dir__)

module Selenium
  module WebDriver
    module Remote
      describe Capabilities do
        it 'converts noProxy from string to array' do
          proxy = Proxy.new(no_proxy: 'proxy_url, localhost')
          caps = described_class.new(proxy: proxy)
          expect(caps.as_json['proxy']['noProxy']).to eq(%w[proxy_url localhost])
        end

        it 'does not convert noProxy if it is already array' do
          proxy = Proxy.new(no_proxy: ['proxy_url'])
          caps = described_class.new(proxy: proxy)
          expect(caps.as_json['proxy']['noProxy']).to eq(['proxy_url'])
        end

        it 'defaults to no proxy' do
          expect(described_class.new.proxy).to be_nil
        end

        it 'can set and get standard capabilities' do
          caps = described_class.new

          caps.browser_name = 'foo'
          expect(caps.browser_name).to eq('foo')

          caps.page_load_strategy = :eager
          expect(caps.page_load_strategy).to eq(:eager)
        end

        it 'can set and get arbitrary capabilities' do
          caps = described_class.new(browser_name: 'chrome')
          caps['chrome'] = :foo
          expect(caps['chrome']).to eq(:foo)
        end

        it 'sets the given proxy' do
          proxy = Proxy.new(http: 'proxy_url')
          capabilities = described_class.new(proxy: proxy)

          expect(capabilities.as_json).to eq('proxy' => {'proxyType' => 'manual',
                                                         'httpProxy' => 'proxy_url'})
        end

        it 'accepts a Hash' do
          capabilities = described_class.new(proxy: {http: 'foo:123'})
          expect(capabilities.proxy.http).to eq('foo:123')
        end

        it 'does not contain proxy hash when no proxy settings' do
          capabilities_hash = described_class.new.as_json
          expect(capabilities_hash).not_to have_key('proxy')
        end

        it 'can merge capabilities' do
          a = described_class.new(browser_name: 'chrome')
          b = described_class.new(browser_name: 'firefox')
          a.merge!(b)

          expect(a.browser_name).to eq('firefox')
        end

        it 'can be serialized and deserialized to JSON' do
          caps = described_class.new(browser_name: 'firefox',
                                     timeouts: {
                                       implicit: 1,
                                       page_load: 2,
                                       script: 3
                                     },
                                     'extension:customCapability': true)
          expect(caps).to eq(described_class.json_create(caps.as_json))
        end

        it 'allows to set alwaysMatch' do
          expected = {'alwaysMatch' => {'browserName' => 'chrome'}}
          expect(described_class.always_match(browser_name: 'chrome').as_json).to eq(expected)
          expect(described_class.always_match('browserName' => 'chrome').as_json).to eq(expected)
          expect(described_class.always_match(described_class.new(browser_name: 'chrome')).as_json).to eq(expected)
        end

        it 'allows to set firstMatch' do
          expected = {'firstMatch' => [{'browserName' => 'chrome'}, {'browserName' => 'firefox'}]}
          expect(described_class.first_match({browser_name: 'chrome'},
                                             {browser_name: 'firefox'}).as_json).to eq(expected)
          expect(described_class.first_match({'browserName' => 'chrome'},
                                             {'browserName' => 'firefox'}).as_json).to eq(expected)
          expect(described_class.first_match(described_class.new(browser_name: 'chrome'),
                                             described_class.new(browser_name: 'firefox')).as_json).to eq(expected)
        end

        describe 'timeouts' do
          let(:as_json) do
            {
              'browserName' => 'chrome',
              'timeouts' => {
                'implicit' => 1,
                'pageLoad' => 2,
                'script' => 3
              }
            }
          end

          it 'processes timeouts as hash' do
            caps = described_class.new(browser_name: 'chrome', timeouts: {implicit: 1, page_load: 2, script: 3})
            expect(caps.timeouts).to eq(implicit: 1, page_load: 2, script: 3)
            expect(caps.implicit_timeout).to eq(1)
            expect(caps.page_load_timeout).to eq(2)
            expect(caps.script_timeout).to eq(3)
            expect(caps.as_json).to eq(as_json)
          end

          it 'processes timeouts via timeouts reader' do
            caps = described_class.new(browser_name: 'chrome')
            caps.timeouts[:implicit] = 1
            caps.timeouts[:page_load] = 2
            caps.timeouts[:script] = 3
            expect(caps.timeouts).to eq(implicit: 1, page_load: 2, script: 3)
            expect(caps.implicit_timeout).to eq(1)
            expect(caps.page_load_timeout).to eq(2)
            expect(caps.script_timeout).to eq(3)
            expect(caps.as_json).to eq(as_json)
          end

          it 'processes timeouts via per-timeout writers' do
            caps = described_class.new(browser_name: 'chrome')
            caps.implicit_timeout = 1
            caps.page_load_timeout = 2
            caps.script_timeout = 3
            expect(caps.timeouts).to eq(implicit: 1, page_load: 2, script: 3)
            expect(caps.implicit_timeout).to eq(1)
            expect(caps.page_load_timeout).to eq(2)
            expect(caps.script_timeout).to eq(3)
            expect(caps.as_json).to eq(as_json)
          end
        end
      end
    end # Remote
  end # WebDriver
end # Selenium
