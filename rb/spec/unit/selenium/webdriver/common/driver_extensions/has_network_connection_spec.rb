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

require File.expand_path('../../spec_helper', __dir__)

module Selenium
  module WebDriver
    module DriverExtensions
      describe HasNetworkConnection do
        class FakeDriver
          include HasNetworkConnection
          attr_reader :bridge
          def initialize(bridge)
            @bridge = bridge
          end
        end

        let(:driver) { FakeDriver.new(instance_double(Remote::Bridge)) }

        describe '#network_connection' do
          it 'returns the correct connection type' do
            allow(driver.bridge).to receive(:network_connection).and_return(1)

            expect(driver.network_connection_type).to eq :airplane_mode
          end

          it 'returns an unknown connection value' do
            allow(driver.bridge).to receive(:network_connection).and_return(5)

            expect(driver.network_connection_type).to eq 5
          end
        end

        describe '#network_connection=' do
          it 'sends out the correct connection value' do
            expect(driver.bridge).to receive(:network_connection=).with(1)

            driver.network_connection_type = :airplane_mode
          end

          it 'returns an error when an invalid argument is given' do
            expect { driver.network_connection_type = :something }
              .to raise_error(ArgumentError, 'Invalid connection type')
          end
        end
      end
    end # DriverExtensions
  end # WebDriver
end # Selenium
