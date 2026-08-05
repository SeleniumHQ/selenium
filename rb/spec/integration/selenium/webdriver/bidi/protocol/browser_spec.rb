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

require_relative '../../spec_helper'
require 'selenium/webdriver/bidi/protocol'
require 'tmpdir'

module Selenium
  module WebDriver
    class BiDi
      module Protocol
        describe Browser, skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          after { |example| reset_driver!(example: example) }

          let(:browser) { described_class.new(driver) }

          def create_user_context
            browser.create_user_context.user_context
          end

          context 'with user contexts and client windows',
                  pending_if: {browser_family: :safari,
                               exception: {class: Error::UnknownCommandError},
                               reason: 'Safari returns unknown command for BiDi user contexts/client windows'} do
            describe '#create_user_context',
                     pending_if: {browser_family: :safari,
                                  exception: {class: Error::SerializationError},
                                  reason: 'Safari create_user_context result fails strict deserialization'} do
              it 'returns the created user context id' do
                user_context = create_user_context

                expect(user_context).to be_a(String)
                expect(browser.get_user_contexts.user_contexts.map(&:user_context)).to include(user_context)
              ensure
                browser.remove_user_context(user_context: user_context) if user_context
              end

              it 'accepts optional proxy and prompt behavior parameters' do
                user_context = browser.create_user_context(
                  accept_insecure_certs: true,
                  proxy: Session::DirectProxyConfiguration.new,
                  unhandled_prompt_behavior: Session::UserPromptHandler.new(default: :dismiss)
                ).user_context

                expect(user_context).to be_a(String)
              ensure
                browser.remove_user_context(user_context: user_context) if user_context
              end
            end

            describe '#get_client_windows' do
              it 'returns typed client window information' do
                windows = browser.get_client_windows.client_windows

                expect(windows).not_to be_empty
                expect(windows.first).to be_a(Browser::ClientWindowInfo)
                expect(windows.first.client_window).to be_a(String)
                expect(windows.first.active).to be(true).or be(false)
                expect(windows.first.width).to be_positive
                expect(windows.first.height).to be_positive
                expect(%i[fullscreen maximized minimized normal].include?(windows.first.state)).to be(true)
              end
            end

            describe '#get_user_contexts',
                     pending_if: {browser_family: :safari,
                                  exception: {class: Error::SerializationError},
                                  reason: 'Safari create_user_context result fails strict deserialization'} do
              it 'includes newly created user contexts' do
                user_contexts = Array.new(2) { create_user_context }
                all_ids = browser.get_user_contexts.user_contexts.map(&:user_context)

                expect(all_ids).to include(*user_contexts)
              ensure
                user_contexts&.each { |id| browser.remove_user_context(user_context: id) }
              end
            end

            describe '#remove_user_context',
                     pending_if: {browser_family: :safari,
                                  exception: {class: Error::SerializationError},
                                  reason: 'Safari create_user_context result fails strict deserialization'} do
              it 'removes the requested user context' do
                user_context = create_user_context

                browser.remove_user_context(user_context: user_context)

                expect(browser.get_user_contexts.user_contexts.map(&:user_context)).not_to include(user_context)
              end
            end

            describe '#set_client_window_state' do
              it 'sets a client window to a normal rectangle' do
                client_window = browser.get_client_windows.client_windows.first.client_window

                result = browser.set_client_window_state(
                  client_window: client_window,
                  state: :normal,
                  width: 640,
                  height: 480,
                  x: 10,
                  y: 10
                )

                expect(result).to be_a(Browser::ClientWindowInfo)
                expect(result.client_window).to eq(client_window)
                expect(result.state).to eq(:normal)
                expect(result.width).to be >= 320
                expect(result.height).to be >= 240
              end
            end

            describe '#set_download_behavior' do
              it 'allows downloads into a requested folder',
                 skip_if: {browser: %i[chrome edge firefox], platform: :windows,
                           reason: 'Times out waiting for the download to complete'} do
                Dir.mktmpdir('selenium-bidi-downloads') do |directory|
                  behavior = Browser::DownloadBehavior::Allowed.new(destination_folder: directory)
                  browser.set_download_behavior(download_behavior: behavior)

                  driver.navigate.to url_for('downloads/download.html')
                  driver.find_element(id: 'file-1').click

                  wait.until { Dir.children(directory).any? { |file| file.start_with?('file_1') } }
                  expect(Dir.children(directory)).to include(a_string_matching(/^file_1.*\.txt$/))
                ensure
                  browser.set_download_behavior(download_behavior: nil)
                end
              end

              it 'accepts a user-context scoped download behavior',
                 pending_if: {browser_family: :safari,
                              exception: {class: Error::SerializationError},
                              reason: 'Safari create_user_context result fails strict deserialization'} do
                user_context = create_user_context
                behavior = Browser::DownloadBehavior::Denied.new

                expect(browser.set_download_behavior(download_behavior: behavior,
                                                     user_contexts: [user_context])).to be_empty
              ensure
                browser.set_download_behavior(download_behavior: nil, user_contexts: [user_context]) if user_context
                browser.remove_user_context(user_context: user_context) if user_context
              end
            end
          end

          describe '#close',
                   pending_if: {browser: :firefox,
                                exception: {class: Error::UnsupportedOperationError,
                                            message: /Closing the browser in a session /},
                                reason: 'Firefox unsupported operation for browser.close on Classic sessions'},
                   skip_if: {browser_family: :safari,
                             reason: 'Times out: browser.close hangs on Safari'} do
            it 'closes the browser session' do
              driver.navigate.to url_for('blank.html')

              expect(browser.close).to be_empty
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
