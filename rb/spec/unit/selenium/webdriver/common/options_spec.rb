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
    module Common
      describe Options do
        subject(:options) { described_class.new }

        describe '#initialize' do
          it 'accepts w3c compliant options' do
            proxy = Proxy.new(auto_detect: true)

            w3c_opts = {browser_version: '1',
                        platform_name: 'Mint',
                        accept_insecure_certs: true,
                        page_load_strategy: 'eager',
                        proxy: proxy,
                        set_window_rect: {width: 100, height: 100},
                        timeouts: {implicit: 1, page_load: 20},
                        unhandled_prompt_behavior: 'dismiss',
                        strict_file_interactability: true}

            options = described_class.new(w3c_opts)
            w3c_opts.each do |key, value|
              expect(options.send(key)).to eq value
            end
          end

          it 'accepts custom options' do
            custom_opts = {'company:options': {foo: 'bar'}}
            custom = described_class.new(custom_opts).custom

            expect(custom).to eq(custom_opts)
          end

          it 'displays deprecation for invalid custom options' do
            invalid_opts = {invalid: 'foo'}

            message = "WARN Selenium \\[DEPRECATION\\] Using invalid directly in Options is deprecated"

            expect {
              custom = described_class.new(invalid_opts).custom
              expect(custom).to eq(invalid_opts)
            }.to output(/#{message}/).to_stdout_from_any_process
          end
        end

        describe '#as_json' do
          it 'returns a JSON hash' do
            proxy = Proxy.new(auto_detect: true)

            w3c_opts = {browser_version: '1',
                        platform_name: 'Mint',
                        accept_insecure_certs: true,
                        page_load_strategy: 'eager',
                        proxy: proxy,
                        set_window_rect: {width: 100, height: 100},
                        timeouts: {implicit: 1, page_load: 20},
                        unhandled_prompt_behavior: 'dismiss',
                        strict_file_interactability: true}

            json = described_class.new(w3c_opts).as_json

            expect(json['browserVersion']).to eq("1")
            expect(json['platformName']).to eq('Mint')
            expect(json['acceptInsecureCerts']).to eq(true)
            expect(json['pageLoadStrategy']).to include('eager')
            expect(json['proxy']).to eq(proxy.as_json)
            expect(json['setWindowRect']['width']).to eq(100)
            expect(json['setWindowRect']['height']).to eq(100)
            expect(json['timeouts']['implicit']).to eq(1)
            expect(json['timeouts']['pageLoad']).to eq(20)
            expect(json['unhandledPromptBehavior']).to eq('dismiss')
            expect(json['strictFileInteractability']).to eq(true)
          end
        end
      end # Options
    end # Chrome
  end # WebDriver
end # Selenium
