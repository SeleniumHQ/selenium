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
    module Safari
      describe Options do
        subject(:options) { described_class.new }

        describe '#initialize' do
          it 'accepts all defined parameters' do
            allow(File).to receive(:directory?).and_return(true)

            opts = described_class.new(browser_version: '12',
                                       platform_name: 'mac_sierra',
                                       accept_insecure_certs: false,
                                       page_load_strategy: 'eager',
                                       unhandled_prompt_behavior: 'accept',
                                       strict_file_interactability: true,
                                       timeouts: {script: 40000,
                                                  page_load: 400000,
                                                  implicit: 1},
                                       set_window_rect: false, in_private: true,
                                       automatic_profiling: false,
                                       automatic_inspection: true,
                                       'custom:options': {foo: 'bar'})

            expect(opts.automatic_profiling).to be(false)
            expect(opts.automatic_inspection).to be(true)
            expect(opts.browser_name).to eq('safari')
            expect(opts.browser_version).to eq('12')
            expect(opts.platform_name).to eq('mac_sierra')
            expect(opts.accept_insecure_certs).to be(false)
            expect(opts.page_load_strategy).to eq('eager')
            expect(opts.unhandled_prompt_behavior).to eq('accept')
            expect(opts.strict_file_interactability).to be(true)
            expect(opts.timeouts).to eq(script: 40000, page_load: 400000, implicit: 1)
            expect(opts.set_window_rect).to be(false)
            expect(opts.options[:'custom:options']).to eq(foo: 'bar')
          end
        end

        describe '#add_option' do
          context 'when namespaced' do
            it 'adds an option with ordered pairs' do
              options.add_option('safari:foo', 'bar')
              expect(options.instance_variable_get(:@options)['safari:foo']).to eq('bar')
            end

            it 'adds an option with keyword' do
              options.add_option('safari:foo': 'bar')
              expect(options.instance_variable_get(:@options)[:'safari:foo']).to eq('bar')
            end
          end

          context 'when not namespaced' do
            it 'adds an option with ordered pairs' do
              expect {
                options.add_option(:foo, 'bar')
              }.to raise_error(ArgumentError, /Safari does not support options that are not namespaced/)
            end

            it 'raises exception with keyword' do
              expect {
                options.add_option(foo: 'bar')
              }.to raise_error(ArgumentError, /Safari does not support options that are not namespaced/)
            end
          end
        end

        describe '#as_json' do
          it 'returns empty options by default' do
            expect(options.as_json).to eq('browserName' => 'safari')
          end

          it 'returns added options' do
            options.add_option('safari:foo', 'bar')
            expect(options.as_json).to eq('browserName' => 'safari',
                                          'safari:foo' => 'bar')
          end

          it 'returns JSON hash' do
            opts = described_class.new(browser_version: '12',
                                       platform_name: 'mac_sierra',
                                       accept_insecure_certs: false,
                                       page_load_strategy: 'eager',
                                       unhandled_prompt_behavior: 'accept',
                                       strict_file_interactability: true,
                                       timeouts: {script: 40000,
                                                  page_load: 400000,
                                                  implicit: 1},
                                       set_window_rect: false,
                                       automatic_profiling: false,
                                       automatic_inspection: true,
                                       'safari:foo': 'foo')

            expect(opts.as_json).to eq('browserName' => 'safari',
                                       'browserVersion' => '12',
                                       'platformName' => 'mac_sierra',
                                       'acceptInsecureCerts' => false,
                                       'pageLoadStrategy' => 'eager',
                                       'unhandledPromptBehavior' => 'accept',
                                       'strictFileInteractability' => true,
                                       'timeouts' => {'script' => 40000,
                                                      'pageLoad' => 400000,
                                                      'implicit' => 1},
                                       'setWindowRect' => false,
                                       'safari:automaticInspection' => true,
                                       'safari:automaticProfiling' => false,
                                       'safari:foo' => 'foo')
          end
        end
      end # Options
    end # Safari
  end # WebDriver
end # Selenium
