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
      describe Service do
        let(:resp) { {'sessionId' => 'foo', 'value' => Remote::Capabilities.chrome.as_json} }
        let(:service) { instance_double(Service, start: true, uri: 'http://example.com') }
        let(:caps) { Remote::Capabilities.chrome }
        let(:http) { instance_double(Remote::Http::Default, call: resp).as_null_object }

        before do
          allow(Remote::Capabilities).to receive(:chrome).and_return(caps)
          allow_any_instance_of(Service).to receive(:start)
          allow_any_instance_of(Service).to receive(:binary_path)
        end

        it 'does not start driver when receives url' do
          expect(Service).not_to receive(:new)
          expect(http).to receive(:server_url=).with(URI.parse('http://example.com:4321'))

          Driver.new(http_client: http, url: 'http://example.com:4321')
        end

        it 'defaults to desired path and port' do
          expect(Service).to receive(:new).with(Chrome.driver_path, Service::DEFAULT_PORT, {}).and_return(service)

          Driver.new(http_client: http)
        end

        it 'accepts a driver path & port' do
          path = '/foo/chromedriver'
          port = '1234'
          expect(Service).to receive(:new).with(path, '1234', {}).and_return(service)

          Driver.new(http_client: http, driver_path: path, port: port)
        end

        it 'accepts driver options' do
          driver_opts = {port_server: '2323',
                         whitelisted_ips: ['192.168.0.1', '192.168.0.2'],
                         silent: true,
                         log_path: '/path/to/log'}

          args = ["--log-path=#{driver_opts[:log_path]}",
                  "--port-server=#{driver_opts[:port_server]}",
                  "--whitelisted-ips=#{driver_opts[:whitelisted_ips]}",
                  "--silent"]

          driver = Driver.new(http_client: http, driver_opts: driver_opts)
          expect(driver.instance_variable_get("@service").instance_variable_get("@extra_args")).to eq args
        end

        it 'deprecates `service_args`' do
          args = ["--port-server=2323",
                  "--whitelisted-ips=['192.168.0.1', '192.168.0.2']",
                  "--silent",
                  "--log-path=/path/to/log"]

          message = /\[DEPRECATION\] `:service_args` is deprecated. Pass switches using `driver_opts`/

          expect { @driver = Driver.new(http_client: http, service_args: args) }.to output(message).to_stdout_from_any_process
          expect(@driver.instance_variable_get("@service").instance_variable_get("@extra_args")).to eq args
        end

        it 'deprecates `service_log_path`' do
          message = /\[DEPRECATION\] `:service_log_path` is deprecated. Use `driver_opts: {log_path: \/path\/to\/log}`/

          expect { @driver = Driver.new(http_client: http, service_log_path: "/path/to/log") }.to output(message).to_stdout_from_any_process
          expect(@driver.instance_variable_get("@service").instance_variable_get("@extra_args")).to eq ["--log-path=/path/to/log"]
        end
      end
    end # Chrome
  end # WebDriver
end # Selenium
