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
# "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

require_relative '../spec_helper'
require_relative '../../../../../lib/selenium/webdriver/bidi/session'
require_relative '../../../../../lib/selenium/webdriver/bidi/network'

module Selenium
  module WebDriver
    class BiDi
      describe Network, only: { browser: %i[chrome edge firefox] } do

        it 'adds an intercept' do
          reset_driver!(web_socket_url: true) do |driver|
            network = described_class.new(driver.bidi)
            intercept = network.add_intercept(phases: [described_class::PHASES[:BEFORE_REQUEST]])
            expect(intercept).to_not be_nil
          end
        end

        it 'removes an intercept' do
          reset_driver!(web_socket_url: true) do |driver|
            network = described_class.new(driver.bidi)
            intercept = network.add_intercept(phases: [described_class::PHASES[:BEFORE_REQUEST]])
            expect(network.remove_intercept(intercept['intercept'])).to be_empty
          end
        end
      end
    end
  end
end
