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
    module Edge
      describe Options do
        subject(:options) { described_class.new }

        describe '#initialize' do
          it 'accepts defined parameters' do
            allow(File).to receive(:file?).and_return(true)

            opts = described_class.new(browser_version: '75',
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
                                       prefs: {foo: 'bar'},
                                       binary: '/foo/bar',
                                       extensions: ['foo.crx', 'bar.crx'],
                                       encoded_extensions: ['encoded_foobar'],
                                       foo: 'bar',
                                       emulation: {device_name: :bar},
                                       local_state: {foo: 'bar'},
                                       detach: true,
                                       debugger_address: '127.0.0.1:8181',
                                       exclude_switches: %w[foobar barfoo],
                                       minidump_path: 'linux/only',
                                       perf_logging_prefs: {enable_network: true},
                                       window_types: %w[normal devtools],
                                       android_package: 'package',
                                       android_activity: 'activity',
                                       android_device_serial: '123',
                                       android_use_running_app: true,
                                       'custom:options': {foo: 'bar'})

            expect(opts.args.to_a).to eq(%w[foo bar])
            expect(opts.prefs[:foo]).to eq('bar')
            expect(opts.binary).to eq('/foo/bar')
            expect(opts.extensions).to eq(['foo.crx', 'bar.crx'])
            expect(opts.instance_variable_get(:@options)[:foo]).to eq('bar')
            expect(opts.emulation[:device_name]).to eq(:bar)
            expect(opts.local_state[:foo]).to eq('bar')
            expect(opts.detach).to be(true)
            expect(opts.debugger_address).to eq('127.0.0.1:8181')
            expect(opts.exclude_switches).to eq(%w[foobar barfoo])
            expect(opts.minidump_path).to eq('linux/only')
            expect(opts.perf_logging_prefs[:enable_network]).to be(true)
            expect(opts.window_types).to eq(%w[normal devtools])
            expect(opts.browser_name).to eq('MicrosoftEdge')
            expect(opts.browser_version).to eq('75')
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
            expect(opts.android_use_running_app).to be(true)
            expect(opts.options[:'custom:options']).to eq(foo: 'bar')
          end
        end

        describe '#add_extension' do
          it 'adds an extension' do
            allow(File).to receive(:file?).and_return(true)
            ext = 'foo.crx'
            allow_any_instance_of(described_class)
              .to receive(:encode_file).with(ext).and_return("encoded_#{ext[/([^.]*)/]}")

            options.add_extension(ext)
            expect(options.extensions).to eq([ext])
          end

          it 'raises error when the extension file is missing' do
            allow(File).to receive(:file?).with('/foo/bar').and_return false

            expect { options.add_extension('/foo/bar') }.to raise_error(Error::WebDriverError)
          end

          it 'raises error when the extension file is not .crx' do
            allow(File).to receive(:file?).with('/foo/bar').and_return true

            expect { options.add_extension('/foo/bar') }.to raise_error(Error::WebDriverError)
          end
        end

        describe '#add_encoded_extension' do
          it 'adds an encoded extension' do
            options.add_encoded_extension('foo')
            expect(options.instance_variable_get(:@encoded_extensions)).to include('foo')
          end
        end

        describe '#binary=' do
          it 'sets the binary path' do
            options.binary = '/foo/bar'
            expect(options.binary).to eq('/foo/bar')
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

        describe 'uses webview2 for MS Edge Driver' do
          it 'changes browserName to webview2' do
            options.webview2!
            expect(options.browser_name).to eq('webview2')
          end
        end

        describe '#add_preference' do
          it 'adds a preference' do
            options.add_preference(:foo, 'bar')
            expect(options.prefs[:foo]).to eq('bar')
          end
        end

        describe '#add_emulation' do
          it 'add an emulated device by name' do
            options.add_emulation(device_name: 'iPhone 6')
            expect(options.emulation).to eq(device_name: 'iPhone 6')
          end

          it 'adds emulated device metrics' do
            options.add_emulation(device_metrics: {width: 400})
            expect(options.emulation).to eq(device_metrics: {width: 400})
          end

          it 'adds emulated user agent' do
            options.add_emulation(user_agent: 'foo')
            expect(options.emulation).to eq(user_agent: 'foo')
          end
        end

        describe '#enable_android' do
          it 'adds default android settings' do
            options.enable_android

            expect(options.android_package).to eq('com.android.chrome')
            expect(options.android_activity).to be_nil
            expect(options.android_device_serial).to be_nil
            expect(options.android_use_running_app).to be_nil
          end

          it 'accepts parameters' do
            options.enable_android(package: 'foo',
                                   serial_number: '123',
                                   activity: 'qualified',
                                   use_running_app: true)
            expect(options.android_package).to eq('foo')
            expect(options.android_activity).to eq('qualified')
            expect(options.android_device_serial).to eq('123')
            expect(options.android_use_running_app).to be(true)
          end
        end

        describe '#as_json' do
          it 'returns empty options by default' do
            expect(options.as_json).to eq('browserName' => 'MicrosoftEdge', 'ms:edgeOptions' => {})
          end

          it 'errors when unrecognized capability is passed' do
            options.add_option(:foo, 'bar')

            expect {
              options.as_json
            }.to raise_error(Error::WebDriverError, 'These options are not w3c compliant: {:foo=>"bar"}')
          end

          it 'returns added options' do
            options.add_option('foo:bar', {foo: 'bar'})
            expect(options.as_json).to eq('browserName' => 'MicrosoftEdge',
                                          'foo:bar' => {'foo' => 'bar'},
                                          'ms:edgeOptions' => {})
          end

          it 'returns a JSON hash' do
            allow(File).to receive(:file?).and_return(true)
            allow_any_instance_of(described_class)
              .to receive(:encode_extension).with('foo.crx').and_return('encoded_foo')
            allow_any_instance_of(described_class)
              .to receive(:encode_extension).with('bar.crx').and_return('encoded_bar')

            opts = described_class.new(browser_version: '75',
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
                                       prefs: {foo: 'bar',
                                               key_that_should_not_be_camelcased: 'baz'},
                                       binary: '/foo/bar',
                                       extensions: ['foo.crx', 'bar.crx'],
                                       encoded_extensions: ['encoded_foobar'],
                                       emulation: {device_name: :mine},
                                       local_state: {foo: 'bar'},
                                       detach: true,
                                       debugger_address: '127.0.0.1:8181',
                                       exclude_switches: %w[foobar barfoo],
                                       minidump_path: 'linux/only',
                                       perf_logging_prefs: {enable_network: true},
                                       window_types: %w[normal devtools],
                                       android_package: 'package',
                                       android_activity: 'activity',
                                       android_device_serial: '123',
                                       android_use_running_app: true,
                                       'custom:options': {foo: 'bar'})

            key = 'ms:edgeOptions'
            expect(opts.as_json).to eq('browserName' => 'MicrosoftEdge',
                                       'browserVersion' => '75',
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
                                       key => {'args' => %w[foo bar],
                                               'prefs' => {'foo' => 'bar',
                                                           'key_that_should_not_be_camelcased' => 'baz'},
                                               'binary' => '/foo/bar',
                                               'extensions' => %w[encoded_foobar encoded_foo encoded_bar],
                                               'mobileEmulation' => {'deviceName' => 'mine'},
                                               'localState' => {'foo' => 'bar'},
                                               'detach' => true,
                                               'debuggerAddress' => '127.0.0.1:8181',
                                               'excludeSwitches' => %w[foobar barfoo],
                                               'minidumpPath' => 'linux/only',
                                               'perfLoggingPrefs' => {'enableNetwork' => true},
                                               'windowTypes' => %w[normal devtools],
                                               'androidPackage' => 'package',
                                               'androidActivity' => 'activity',
                                               'androidDeviceSerial' => '123',
                                               'androidUseRunningApp' => true})
          end
        end
      end
    end # Edge
  end # WebDriver
end # Selenium
