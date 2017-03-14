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
    module PhantomJS
      describe Service do
        let(:resp) { {'sessionId' => 'foo', 'value' => @default_capabilities} }
        let(:service) { double(Service, start: true, uri: 'http://example.com') }
        let(:caps) { {} }
        let(:http) { double(Remote::Http::Default, call: resp).as_null_object }

        before do
          @default_capabilities = Remote::Capabilities.phantomjs.as_json
          allow(Remote::Capabilities).to receive(:phantomjs).and_return(caps)
          allow_any_instance_of(Service).to receive(:start)
          allow_any_instance_of(Service).to receive(:binary_path)
        end

        it 'does not start driver when receives url' do
          expect(Service).not_to receive(:new)
          expect(http).to receive(:server_url=).with(URI.parse('http://example.com:4321'))

          Bridge.new(http_client: http, url: 'http://example.com:4321')
        end

        it 'defaults to desired path and port' do
          expect(Service).to receive(:new).with(PhantomJS.driver_path, Service::DEFAULT_PORT, {}).and_return(service)

          Bridge.new(http_client: http)
        end

        it 'accepts a driver path & port' do
          path = '/foo/chromedriver'
          port = '1234'
          expect(Service).to receive(:new).with(path, '1234', {}).and_return(service)

          Bridge.new(http_client: http, driver_path: path, port: port)
        end

        it 'accepts driver options' do
          args = %w[--foo --bar]
          driver_opts = {args: args}

          bridge = Bridge.new(http_client: http, driver_opts: driver_opts)
          expect(bridge.instance_variable_get("@service").instance_variable_get("@extra_args")).to eq args
        end

        it 'reads server arguments from desired capabilities if not given directly' do
          args = ["--foo", "--bar"]

          caps = Remote::Capabilities.phantomjs
          caps['phantomjs.cli.args'] = args

          bridge = Bridge.new(http_client: http, desired_capabilities: caps)
          expect(bridge.instance_variable_get("@service").instance_variable_get("@extra_args")).to eq args
        end

        it 'deprecates `args`' do
          args = ["--foo", "--bar"]

          message = /\[DEPRECATION\] `:args` is deprecated. Pass switches using `driver_opts`/

          expect { @bridge = Bridge.new(http_client: http, args: args) }.to output(message).to_stdout_from_any_process
          expect(@bridge.instance_variable_get("@service").instance_variable_get("@extra_args")).to eq args
        end
      end
    end # PhantomJS
  end # WebDriver
end # Selenium
