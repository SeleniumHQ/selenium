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
    module EdgeHtml
      describe Options do
        subject(:options) { Options.new }

        describe '#initialize' do
          it 'accepts defined parameters' do
            allow(File).to receive(:directory?).and_return(true)

            opts = Options.new(browser_version: '18',
                               platform_name: 'win10',
                               accept_insecure_certs: false,
                               page_load_strategy: 'eager',
                               unhandled_prompt_behavior: 'accept',
                               strict_file_interactability: true,
                               timeouts: {script: 40000,
                                          page_load: 400000,
                                          implicit: 1},
                               set_window_rect: false,
                               in_private: true,
                               extension_paths: ['/path1', '/path2'],
                               start_page: 'http://selenium.dev',
                               'custom:options': {foo: 'bar'})

            expect(opts.in_private).to eq(true)
            expect(opts.extension_paths).to eq(['/path1', '/path2'])
            expect(opts.start_page).to eq('http://selenium.dev')
            expect(opts.browser_name).to eq('MicrosoftEdge')
            expect(opts.browser_version).to eq('18')
            expect(opts.platform_name).to eq('win10')
            expect(opts.accept_insecure_certs).to eq(false)
            expect(opts.page_load_strategy).to eq('eager')
            expect(opts.unhandled_prompt_behavior).to eq('accept')
            expect(opts.strict_file_interactability).to eq(true)
            expect(opts.timeouts).to eq(script: 40000, page_load: 400000, implicit: 1)
            expect(opts.set_window_rect).to eq(false)
            expect(opts.options[:'custom:options']).to eq(foo: 'bar')
          end
        end

        describe '#add_extension path' do
          it 'adds extension path to the list' do
            options.add_extension_path(__dir__)
            expect(options.extension_paths).to eq([__dir__])
          end

          it 'raises error if path is not a directory' do
            expect { options.add_extension_path(__FILE__) }.to raise_error(Error::WebDriverError)
          end
        end

        describe '#as_json' do
          it 'returns options with browser name by default' do
            expect(options.as_json).to eq("browserName" => "MicrosoftEdge")
          end

          it 'returns added option' do
            options.add_option(:foo, 'bar')
            expect(options.as_json).to eq("browserName" => "MicrosoftEdge", "foo" => "bar")
          end

          it 'returns JSON hash' do
            allow(File).to receive(:directory?).and_return(true)

            opts = Options.new(browser_version: '18',
                               platform_name: 'win10',
                               accept_insecure_certs: false,
                               page_load_strategy: 'eager',
                               unhandled_prompt_behavior: 'accept',
                               strict_file_interactability: true,
                               timeouts: {script: 40000,
                                          page_load: 400000,
                                          implicit: 1},
                               set_window_rect: false,
                               in_private: true,
                               extension_paths: ['/path1', '/path2'],
                               start_page: 'http://selenium.dev')

            expect(opts.as_json).to eq('browserName' => 'MicrosoftEdge',
                                       'browserVersion' => '18',
                                       'platformName' => 'win10',
                                       'acceptInsecureCerts' => false,
                                       'pageLoadStrategy' => 'eager',
                                       'unhandledPromptBehavior' => 'accept',
                                       'strictFileInteractability' => true,
                                       'timeouts' => {'script' => 40000,
                                                      'pageLoad' => 400000,
                                                      'implicit' => 1},
                                       'setWindowRect' => false,
                                       'ms:inPrivate' => true,
                                       'ms:extensionPaths' => ['/path1', '/path2'],
                                       'ms:startPage' => 'http://selenium.dev')
          end
        end
      end # Options
    end # Edge
  end # WebDriver
end # Selenium
