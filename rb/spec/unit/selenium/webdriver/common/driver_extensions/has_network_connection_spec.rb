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

require File.expand_path('../../../spec_helper', __FILE__)

module Selenium
  module WebDriver
    module DriverExtensions
      describe HasNetworkConnection do
        class FakeDriver
          include HasNetworkConnection
        end

        let(:driver) { FakeDriver.new }

        describe '#network_connection' do
          it 'returns the correct connection type' do
            allow(@bridge).to receive(:network_connection) { 1 }

            expect(driver.network_connection_type).to eq :airplane_mode
          end

          it 'returns an unknown connection value' do
            allow(@bridge).to receive(:network_connection) { 5 }

            expect(driver.network_connection_type).to eq 5
          end
        end

        describe '#network_connection=' do
          it 'sends out the correct connection value' do
            expect(@bridge).to receive(:network_connection=).with(1)

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
