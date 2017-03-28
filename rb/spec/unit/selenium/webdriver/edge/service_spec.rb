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
    module Edge
      describe Service do
        let(:service_path) { '/path/to/service' }

        it 'accepts driver options' do
          driver_opts = {host: 'localhost',
                         package: '/path/to/pkg',
                         verbose: true}

          args = ["–host=#{driver_opts[:host]}",
                  "–package=#{driver_opts[:package]}",
                  "-verbose"]

          allow_any_instance_of(Service).to receive(:binary_path).and_return(service_path)
          service = Service.new(nil, Service::DEFAULT_PORT, driver_opts)
          expect(service.instance_variable_get('@extra_args')).to eq args
        end
      end
    end # Edge
  end # WebDriver
end # Selenium
