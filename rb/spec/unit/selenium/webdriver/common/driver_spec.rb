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
    describe Driver do
      let(:bidi) { instance_double(BiDi).as_null_object }
      let(:bridge) { instance_double(Remote::Bridge, browser: nil, bidi: bidi) }
      let(:driver) { described_class.new(bridge: bridge) }

      before { allow(WebDriver.logger).to receive(:deprecate) }

      describe '#bidi' do
        it 'deprecates once per call in favor of the protocol domains' do
          expect(driver.bidi).to eq bidi

          expect(WebDriver.logger).to have_received(:deprecate)
            .with('Driver#bidi',
                  'BiDi::Protocol::<Domain>.new(driver)',
                  id: :driver_bidi,
                  reference: 'https://www.selenium.dev/documentation/warnings/bidi-implementation/')
            .once
        end
      end

      it 'does not deprecate when Selenium reaches BiDi on the user\'s behalf' do
        driver.network
        driver.script

        expect(WebDriver.logger).not_to have_received(:deprecate)
      end
    end
  end
end
