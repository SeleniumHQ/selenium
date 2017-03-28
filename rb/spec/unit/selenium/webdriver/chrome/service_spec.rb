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
        let(:service_path) { '/path/to/service' }

        it 'accepts driver options' do
          driver_opts = {port_server: '2323',
                         whitelisted_ips: ['192.168.0.1', '192.168.0.2'],
                         silent: true,
                         log_path: '/path/to/log'}

          args = ["--log-path=#{driver_opts[:log_path]}",
                  "--port-server=#{driver_opts[:port_server]}",
                  "--whitelisted-ips=#{driver_opts[:whitelisted_ips]}",
                  "--silent"]

          allow_any_instance_of(Service).to receive(:binary_path).and_return(service_path)
          service = Service.new(nil, Service::DEFAULT_PORT, driver_opts)
          expect(service.instance_variable_get('@extra_args')).to eq args
        end

      end
    end # Chrome
  end # WebDriver
end # Selenium
