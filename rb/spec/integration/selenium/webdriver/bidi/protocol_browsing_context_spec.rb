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
      module Protocol
        describe BrowsingContext, skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          after { |example| reset_driver!(example: example) }

          let(:browsing_context) { described_class.new(driver) }

          it 'errors when bidi not enabled' do
            reset_driver!(web_socket_url: false) do |driver|
              msg = /BiDi must be enabled by setting #web_socket_url to true in options class/
              expect { described_class.new(driver) }.to raise_error(WebDriver::Error::WebDriverError, msg)
            end
          end

          describe '#create' do
            it 'accepts a tab type' do
              id = browsing_context.create(type: :tab).context

              expect(driver.window_handles).to include(id)
            end

            it 'accepts a window type' do
              id = browsing_context.create(type: :window).context

              expect(driver.window_handles).to include(id)
            end

            it 'accepts a reference context' do
              id = driver.window_handle
              result = browsing_context.create(type: :tab, reference_context: id).context

              expect(driver.window_handles).to include(id, result)
            end

            it 'rejects an unknown type before sending it' do
              expect {
                browsing_context.create(type: :unknown)
              }.to raise_error(ArgumentError, /type must be one of/)
            end
          end

          it 'closes a window' do
            window1 = browsing_context.create(type: :tab).context
            window2 = browsing_context.create(type: :tab).context

            browsing_context.close(context: window2)

            handles = driver.window_handles
            expect(handles).to include(window1)
            expect(handles).not_to include(window2)
          end

          it 'sets the viewport' do
            browsing_context.set_viewport(
              context: driver.window_handle,
              viewport: BrowsingContext::Viewport.new(width: 800, height: 600),
              device_pixel_ratio: 2.0
            )

            expect(driver.execute_script('return [window.innerWidth, window.innerHeight]')).to eq([800, 600])
          end

          it 'accepts users prompts without text',
             pending_if: {browser: %i[edge chrome],
                          reason: 'https://github.com/GoogleChromeLabs/chromium-bidi/issues/3281'} do
            driver.navigate.to url_for('alerts.html')
            driver.find_element(id: 'alert').click
            wait_for_alert
            browsing_context.handle_user_prompt(context: driver.window_handle, accept: true)
            wait_for_no_alert

            expect(driver.title).to eq('Testing Alerts')
          end

          it 'accepts users prompts with text',
             pending_if: {browser: %i[edge chrome],
                          reason: 'https://github.com/GoogleChromeLabs/chromium-bidi/issues/3281'} do
            driver.navigate.to url_for('alerts.html')
            driver.find_element(id: 'prompt').click
            wait_for_alert
            browsing_context.handle_user_prompt(context: driver.window_handle, accept: true, user_text: 'Hello, world!')
            wait_for_no_alert

            expect(driver.title).to eq('Testing Alerts')
          end

          it 'rejects users prompts',
             pending_if: {browser: %i[edge chrome],
                          reason: 'https://github.com/GoogleChromeLabs/chromium-bidi/issues/3281'} do
            driver.navigate.to url_for('alerts.html')
            driver.find_element(id: 'alert').click
            wait_for_alert
            browsing_context.handle_user_prompt(context: driver.window_handle, accept: false)
            wait_for_no_alert

            expect(driver.title).to eq('Testing Alerts')
          end

          it 'activates a browser context',
             pending_if: {browser: %i[safari safari_preview], reason: 'Safari does not focus the activated context'} do
            window = driver.window_handle
            browsing_context.create(type: :tab)

            expect(driver.execute_script('return document.hasFocus();')).to be_falsey
            browsing_context.activate(context: window)
            expect(driver.execute_script('return document.hasFocus();')).to be_truthy
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
