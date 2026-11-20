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
require 'selenium/webdriver/bidi/protocol'

module Selenium
  module WebDriver
    class BiDi
      describe BrowsingContext, skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
        after do
          (driver.window_handles - [driver.window_handle]).each { |handle| browsing_context.close(context_id: handle) }
        end

        def browsing_context
          return @browsing_context if @browsing_context

          bridge = driver.instance_variable_get(:@bridge)
          expect { @browsing_context = described_class.new(bridge) }.to have_deprecated(:bidi_browsing_context)
          @browsing_context
        end

        describe '#create' do
          it 'without arguments' do
            id = browsing_context.create

            expect(driver.window_handles).to include(id)
          end

          it 'accepts a tab type' do
            id = browsing_context.create(type: :tab)

            expect(driver.window_handles).to include(id)
          end

          it 'accepts a window type' do
            id = browsing_context.create(type: :window)

            expect(driver.window_handles).to include(id)
          end

          it 'errors on unknown type' do
            expect {
              browsing_context.create(type: :unknown)
            }.to raise_error(Error::WebDriverError, /\Ainvalid argument: /)
          end

          it 'accepts a reference context' do
            id = driver.window_handle
            result = browsing_context.create(context_id: id)

            expect(driver.window_handles).to include(id, result)
          end
        end

        it 'closes a window' do
          window1 = browsing_context.create
          window2 = browsing_context.create

          browsing_context.close(context_id: window2)

          handles = driver.window_handles
          expect(handles).to include(window1)
          expect(handles).not_to include(window2)
        end

        it 'sets the viewport' do
          browsing_context.set_viewport(width: 800, height: 600, device_pixel_ratio: 2.0)
          expect(driver.execute_script('return [window.innerWidth, window.innerHeight]')).to eq([800, 600])
        ensure
          Protocol::BrowsingContext.new(driver).set_viewport(context: driver.window_handle, viewport: nil,
                                                             device_pixel_ratio: nil)
        end

        context 'when a prompt is open' do
          # The default unhandled prompt behavior dismisses a prompt before the example can handle it
          let(:driver) { local_driver(unhandled_prompt_behavior: :ignore) }

          it 'accepts users prompts without text' do
            driver.navigate.to url_for('alerts.html')
            driver.find_element(id: 'alert').click
            wait_for_alert
            window = driver.window_handles.first
            browsing_context.handle_user_prompt(window, accept: true)
            wait_for_no_alert

            expect(driver.title).to eq('Testing Alerts')
          end

          it 'accepts users prompts with text' do
            driver.navigate.to url_for('alerts.html')
            driver.find_element(id: 'prompt').click
            wait_for_alert
            window = driver.window_handles.first
            browsing_context.handle_user_prompt(window, accept: true, text: 'Hello, world!')
            wait_for_no_alert

            expect(driver.title).to eq('Testing Alerts')
          end

          it 'rejects users prompts' do
            driver.navigate.to url_for('alerts.html')
            driver.find_element(id: 'alert').click
            wait_for_alert
            window = driver.window_handles.first

            browsing_context.handle_user_prompt(window, accept: false)
            wait_for_no_alert

            expect(driver.title).to eq('Testing Alerts')
          end
        end

        it 'activates a browser context',
           pending_if: {browser_family: :safari, reason: 'Safari does not focus the activated context'} do
          browsing_context.create(type: :tab)

          expect(driver.execute_script('return document.hasFocus();')).to be_falsey
          browsing_context.activate
          expect(driver.execute_script('return document.hasFocus();')).to be_truthy
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
