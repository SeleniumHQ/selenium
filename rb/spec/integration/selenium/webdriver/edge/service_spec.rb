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

require_relative '../spec_helper'

module Selenium
  module WebDriver
    module Edge
      describe Service, exclusive: {browser: :edge} do
        let(:service) { described_class.new }
        let(:service_manager) { service.launch }

        before { service.executable_path = DriverFinder.path(Options.new, described_class) }
        after { service_manager.stop }

        it 'auto uses edgedriver' do
          expect(service_manager.uri).to be_a(URI)
        end
      end
    end # Edge
  end # WebDriver
end # Selenium
