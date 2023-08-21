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
        subject(:options) { described_class.new }

        describe '#initialize' do
          it 'sets provided parameters' do
            profile = Profile.new
            allow(profile).to receive(:encoded).and_return('encoded_profile')

            opts = described_class.new(browser_version: '66',
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
                                       env: {'FOO' => 'bar'},
                                       foo: 'bar',
                                       profile: profile,
                                       log_level: :debug,
                                       android_package: 'package',
                                       android_activity: 'activity',
                                       android_device_serial: '123',
                                       android_intent_arguments: %w[foo bar],
                                       'custom:options': {foo: 'bar'})

            expect(opts.args.to_a).to eq(%w[foo bar])
            expect(opts.binary).to eq('/foo/bar')
            expect(opts.prefs[:foo]).to eq('bar')
            expect(opts.env['FOO']).to eq('bar')
            expect(opts.instance_variable_get(:@options)[:foo]).to eq('bar')
            expect(opts.profile).to eq(profile)
            expect(opts.log_level).to eq(:debug)
            expect(opts.browser_name).to eq('firefox')
            expect(opts.browser_version).to eq('66')
            expect(opts.platform_name).to eq('win10')
            expect(opts.accept_insecure_certs).to be(false)
            expect(opts.page_load_strategy).to eq('eager')
            expect(opts.unhandled_prompt_behavior).to eq('accept')
            expect(opts.strict_file_interactability).to be(true)
            expect(opts.timeouts).to eq(script: 40000, page_load: 400000, implicit: 1)
            expect(opts.set_window_rect).to be(false)
            expect(opts.android_package).to eq('package')
            expect(opts.android_activity).to eq('activity')
            expect(opts.android_device_serial).to eq('123')
            expect(opts.android_intent_arguments).to eq(%w[foo bar])
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

          it 'adds an ENV' do
            options.env['FOO'] = 'bar'
            expect(options.env['FOO']).to eq('bar')
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

        describe '#add_argument' do
          it 'adds a command-line argument' do
            options.add_argument('foo')
            expect(options.args.to_a).to eq(['foo'])
          end
        end

        describe '#add_option' do
          it 'adds vendor namespaced options with ordered pairs' do
            options.add_option('foo:bar', {bar: 'foo'})
            expect(options.instance_variable_get(:@options)['foo:bar']).to eq({bar: 'foo'})
          end

          it 'adds vendor namespaced options with Hash' do
            options.add_option('foo:bar' => {bar: 'foo'})
            expect(options.instance_variable_get(:@options)['foo:bar']).to eq({bar: 'foo'})
          end
        end

        describe '#add_preference' do
          it 'adds a preference' do
            options.add_preference(:foo, 'bar')
            expect(options.prefs[:foo]).to eq('bar')
          end

          it 'does not camelize preferences' do
            options.add_preference('intl.accepted_languages', 'en-US')

            prefs    = options.as_json['moz:firefoxOptions']['prefs']
            expected = {'intl.accepted_languages' => 'en-US'}
            expect(prefs).to eq(expected)
          end
        end

        describe '#enable_android' do
          it 'adds default android settings' do
            options.enable_android

            expect(options.android_package).to eq('org.mozilla.firefox')
            expect(options.android_activity).to be_nil
            expect(options.android_device_serial).to be_nil
            expect(options.android_intent_arguments).to be_nil
          end

          it 'accepts parameters' do
            options.enable_android(package: 'foo',
                                   serial_number: '123',
                                   activity: 'qualified',
                                   intent_arguments: %w[foo bar])
            expect(options.android_package).to eq('foo')
            expect(options.android_activity).to eq('qualified')
            expect(options.android_device_serial).to eq('123')
            expect(options.android_intent_arguments).to eq(%w[foo bar])
          end
        end

        describe '#as_json' do
          it 'returns empty options by default' do
            expect(options.as_json).to eq('browserName' => 'firefox',
                                          'acceptInsecureCerts' => true,
                                          'moz:firefoxOptions' => {},
                                          'moz:debuggerAddress' => true)
          end

          it 'returns added options' do
            options.add_option('foo:bar', {foo: 'bar'})
            expect(options.as_json).to eq('acceptInsecureCerts' => true,
                                          'browserName' => 'firefox',
                                          'foo:bar' => {'foo' => 'bar'},
                                          'moz:debuggerAddress' => true,
                                          'moz:firefoxOptions' => {})
          end

          it 'converts to a json hash' do
            profile = Profile.new
            allow(profile).to receive(:as_json).and_return('encoded_profile')

            opts = described_class.new(browser_version: '66',
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
                                       env: {'FOO' => 'bar'},
                                       profile: profile,
                                       log_level: :debug,
                                       android_package: 'package',
                                       android_activity: 'activity',
                                       android_device_serial: '123',
                                       android_intent_arguments: %w[foo bar],
                                       'custom:options': {foo: 'bar'})

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
                                       'custom:options' => {'foo' => 'bar'},
                                       'moz:debuggerAddress' => true,
                                       key => {'args' => %w[foo bar],
                                               'binary' => '/foo/bar',
                                               'prefs' => {'foo' => 'bar'},
                                               'env' => {'FOO' => 'bar'},
                                               'profile' => 'encoded_profile',
                                               'log' => {'level' => 'debug'},
                                               'androidPackage' => 'package',
                                               'androidActivity' => 'activity',
                                               'androidDeviceSerial' => '123',
                                               'androidIntentArguments' => %w[foo bar]})
          end
        end
      end # Options
    end # Chrome
  end # WebDriver
end # Selenium
