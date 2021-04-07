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
    module Firefox
      describe Options do
        subject(:options) { Options.new }

        describe '#initialize' do
          it 'sets provided parameters' do
            profile = Profile.new
            allow(profile).to receive(:encoded).and_return('encoded_profile')

            opts = Options.new(browser_version: '66',
                               platform_name: 'win10',
                               accept_insecure_certs: false,
                               page_load_strategy: 'eager',
                               unhandled_prompt_behavior: 'accept',
                               strict_file_interactability: true,
                               timeouts: {script: 40000,
                                          page_load: 400000,
                                          implicit: 1},
                               set_window_rect: false,
                               args: %w[foo bar],
                               binary: '/foo/bar',
                               prefs: {foo: 'bar'},
                               foo: 'bar',
                               profile: profile,
                               log_level: :debug,
                               'custom:options': {foo: 'bar'})

            expect(opts.args.to_a).to eq(%w[foo bar])
            expect(opts.binary).to eq('/foo/bar')
            expect(opts.prefs[:foo]).to eq('bar')
            expect(opts.instance_variable_get('@options')[:foo]).to eq('bar')
            expect(opts.profile).to eq(profile)
            expect(opts.log_level).to eq(:debug)
            expect(opts.browser_name).to eq('firefox')
            expect(opts.browser_version).to eq('66')
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

        describe 'accessors' do
          it 'adds a command-line argument' do
            options.args << 'foo'
            expect(options.args).to eq(['foo'])
          end

          it 'sets the binary path' do
            options.binary = '/foo/bar'
            expect(options.binary).to eq('/foo/bar')
          end

          it 'adds a preference' do
            options.prefs[:foo] = 'bar'
            expect(options.prefs[:foo]).to eq('bar')
          end
        end

        describe '#log_level=' do
          it 'sets the log level' do
            options.log_level = :debug
            expect(options.log_level).to eq(:debug)
          end
        end

        describe '#profile=' do
          it 'sets a new profile' do
            profile = Profile.new
            allow(profile).to receive(:encoded).and_return('encoded_profile')

            options.profile = profile
            expect(options.profile).to eq(profile)
          end

          it 'sets an existing profile' do
            profile = Profile.new
            allow(profile).to receive(:encoded).and_return('encoded_profile')

            allow(Profile).to receive(:from_name).with('custom_profile_name').and_return(profile)
            options.profile = 'custom_profile_name'
            expect(options.profile).to eq(profile)
          end
        end

        describe '#headless!' do
          it 'adds the -headless command-line flag' do
            options.headless!
            expect(options.as_json['moz:firefoxOptions']['args']).to include('-headless')
          end
        end

        describe '#add_argument' do
          it 'adds a command-line argument' do
            options.add_argument('foo')
            expect(options.args.to_a).to eq(['foo'])
          end
        end

        describe '#add_option' do
          it 'adds an option' do
            options.add_option(:foo, 'bar')
            expect(options.instance_variable_get('@options')[:foo]).to eq('bar')
          end
        end

        describe '#add_preference' do
          it 'adds a preference' do
            options.add_preference(:foo, 'bar')
            expect(options.prefs[:foo]).to eq('bar')
          end
        end

        describe '#as_json' do
          it 'returns empty options by default' do
            expect(options.as_json).to eq("browserName" => "firefox", "moz:firefoxOptions" => {})
          end

          it 'returns added option' do
            options.add_option(:foo, 'bar')
            expect(options.as_json).to eq("browserName" => "firefox", "moz:firefoxOptions" => {"foo" => "bar"})
          end

          it 'converts to a json hash' do
            profile = Profile.new
            allow(profile).to receive(:as_json).and_return('encoded_profile')

            opts = Options.new(browser_version: '66',
                               platform_name: 'win10',
                               accept_insecure_certs: false,
                               page_load_strategy: 'eager',
                               unhandled_prompt_behavior: 'accept',
                               strict_file_interactability: true,
                               timeouts: {script: 40000,
                                          page_load: 400000,
                                          implicit: 1},
                               set_window_rect: false,
                               args: %w[foo bar],
                               binary: '/foo/bar',
                               prefs: {foo: 'bar'},
                               foo: 'bar',
                               profile: profile,
                               log_level: :debug)

            key = 'moz:firefoxOptions'
            expect(opts.as_json).to eq('browserName' => 'firefox',
                                       'browserVersion' => '66',
                                       'platformName' => 'win10',
                                       'acceptInsecureCerts' => false,
                                       'pageLoadStrategy' => 'eager',
                                       'unhandledPromptBehavior' => 'accept',
                                       'strictFileInteractability' => true,
                                       'timeouts' => {'script' => 40000,
                                                      'pageLoad' => 400000,
                                                      'implicit' => 1},
                                       'setWindowRect' => false,
                                       key => {'args' => %w[foo bar],
                                               'binary' => '/foo/bar',
                                               'prefs' => {'foo' => 'bar'},
                                               'profile' => 'encoded_profile',
                                               'log' => {'level' => 'debug'},
                                               'foo' => 'bar'})
          end
        end
      end # Options
    end # Chrome
  end # WebDriver
end # Selenium
