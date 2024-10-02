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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe BiDi, exclusive: {bidi: true, reason: 'only executed when bidi is enabled'},
                   only: {browser: %i[chrome edge firefox]} do
      after { |example| reset_driver!(example: example) }

      it 'errors when bidi not enabled' do
        reset_driver!(web_socket_url: false) do |driver|
          expect { driver.bidi }.to raise_error(WebDriver::Error::WebDriverError)
        end
      end

      it 'gets session status' do
        status = driver.bidi.session.status
        expect(status).to respond_to(:ready)
        expect(status.message).not_to be_empty
      end

      it 'does not close BiDi session if at least one window is opened' do
        status = driver.bidi.session.status
        expect(status.ready).to be false
        expect(status.message).to be_a String

        driver.switch_to.new_window(:window)
        driver.switch_to.new_window(:tab)
        driver.switch_to.new_window(:tab)

        driver.close

        status_after_closing = driver.bidi.session.status
        expect(status_after_closing.ready).to be false
        expect(status_after_closing.message).to be_a String
      end

      it 'closes BiDi session if last window is closed' do
        status = driver.bidi.session.status
        expect(status.ready).to be false
        expect(status.message).to be_a String

        driver.close

        expect { driver.bidi.session.status }.to raise_error(IOError)
      end
    end
  end
end
