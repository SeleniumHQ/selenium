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
    module Chrome
      describe Bridge do
        let(:service) { double(Service, start: true, uri: 'http://example.com') }

        before { allow_any_instance_of(Bridge).to receive(:create_session) }

        context 'when URL is provided' do
          it 'does not start Service when URL set' do
            expect(Service).not_to receive(:new)

            Bridge.new(url: 'http://example.com:4321')
          end
        end

        context 'when URL is not provided' do
          before { allow(Service).to receive(:new).and_return(service) }

          it 'starts Service with default path and port when URL not set' do
            expect(Service).to receive(:new).with(Chrome.driver_path, Service::DEFAULT_PORT, {}).and_return(service)

            Bridge.new
          end

          it 'passes arguments to Service' do
            driver_path = '/path/to/driver'
            driver_port = 1234
            driver_opts = {foo: 'bar',
                           bar: ['--foo', '--bar']}
            expect(Service).to receive(:new).with(driver_path, driver_port, driver_opts).and_return(service)

            Bridge.new(driver_path: driver_path, port: driver_port, driver_opts: driver_opts)
          end

          it ':service_log_path is passed in to Service as a deprecated parameter' do
            log_path = '/path/to/log'

            expect(Service).to receive(:new).with(Chrome.driver_path, Service::DEFAULT_PORT, {log_path: log_path}).and_return(service)

            message = "`:service_log_path` is deprecated. Use `driver_opts: {log_path: /path/to/log}`"
            expect { Bridge.new(service_log_path: log_path) }.to output(/#{message}/).to_stdout_from_any_process
          end

          it ':service_args are passed in to Service as a deprecated parameter' do
            service_args = ['--foo', '--bar']

            expect(Service).to receive(:new).with(Chrome.driver_path, Service::DEFAULT_PORT, args: service_args).and_return(service)

            message = "`:service_args` is deprecated. Pass switches using `driver_opts`"
            expect { Bridge.new(service_args: service_args) }.to output(/#{message}/).to_stdout_from_any_process
          end

          it 'uses default chrome capabilities when not set' do
            expect_any_instance_of(Bridge).to receive(:create_session).with(Remote::Capabilities.chrome)

            Bridge.new
          end

          it 'uses provided capabilities' do
            capabilities = Remote::Capabilities.chrome(version: '47')
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new(desired_capabilities: capabilities)
          end

          it 'passes through any value added to capabilities' do
            capabilities = Remote::Capabilities.chrome(random: {'foo' => 'bar'})
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new(desired_capabilities: capabilities)
          end

          it 'treats capabilities keys with symbols and camel case strings as equivalent' do
            capabilities_in = Remote::Capabilities.chrome(foo_bar: {'foo' => 'bar'})
            capabilities_out = Remote::Capabilities.chrome('fooBar' => {'foo' => 'bar'})
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities_out)

            Bridge.new(desired_capabilities: capabilities_in)
          end

          it 'accepts Chrome#path' do
            allow(Platform).to receive(:assert_executable)
            chrome_path = 'path/to/chrome'
            allow(Chrome).to receive(:path).and_return(chrome_path)

            capabilities = Remote::Capabilities.chrome(chrome_options: {'binary' => chrome_path})

            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new
          end

          it 'sets args in chrome options with args parameter' do
            args = %w[--foo=bar]
            capabilities = Remote::Capabilities.chrome(chrome_options: {'args' => args})
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new(args: args)
          end

          it 'sets args in chrome options with switches parameter' do
            args = %w[--foo=bar]
            capabilities = Remote::Capabilities.chrome(chrome_options: {'args' => args})
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new(switches: args)
          end

          it 'raises an ArgumentError if args is not an Array' do
            expect { Bridge.new(args: '--foo=bar') }.to raise_error(ArgumentError)
          end

          it 'translates profile into correct chrome_options' do
            profile_path = 'path/to/profile'
            extension = 'foo'
            opts = {'args' => ["--user-data-dir=#{profile_path}"], 'extensions' => [extension]}

            allow(Base64).to receive(:strict_encode64).and_return('foo')
            allow_any_instance_of(Profile).to receive(:verify_model).and_return(profile_path)

            profile = Profile.new
            allow(profile).to receive(:layout_on_disk).and_return(profile_path)

            profile.add_extension(__FILE__)

            capabilities = Remote::Capabilities.chrome(chrome_options: opts)
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new(profile: profile)
          end

          it 'sets chrome to detach from chromedriver' do
            capabilities = Remote::Capabilities.chrome(chrome_options: {'detach' => true})
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new(detach: true)
          end

          it 'sets chrome prefs' do
            prefs = {foo: 'bar'}
            capabilities = Remote::Capabilities.chrome(chrome_options: {'prefs' => prefs})
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new(prefs: prefs)
          end

          it 'sets the proxy capabilitiy' do
            proxy = Proxy.new(http: 'localhost:1234')

            capabilities = Remote::Capabilities.chrome(proxy: proxy)
            expect_any_instance_of(Bridge).to receive(:create_session).with(capabilities)

            Bridge.new(proxy: proxy)
          end
        end
      end
    end # Chrome
  end # WebDriver
end # Selenium
