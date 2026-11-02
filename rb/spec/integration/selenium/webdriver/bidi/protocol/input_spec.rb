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

module Selenium
  module WebDriver
    class BiDi
      module Protocol
        describe Input,
                 pending_if: {browser_family: :safari,
                              reason: 'Safari script.evaluate result fails deserialization in input setup'},
                 skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          after { |example| reset_driver!(example: example) }

          let(:input) { described_class.new(driver) }
          let(:script) { Script.new(driver) }

          def target
            Script::ContextTarget.new(context: driver.window_handle)
          end

          def shared_reference(selector)
            result = script.evaluate(
              expression: "document.querySelector(#{selector.inspect})",
              target: target,
              await_promise: false,
              result_ownership: :root
            )
            Script::SharedReference.new(shared_id: result.result.shared_id, handle: result.result.handle)
          end

          def key_actions(*actions)
            Input::KeySourceActions.new(id: 'keyboard', actions: actions)
          end

          def press(key)
            [Input::KeyDownAction.new(value: key), Input::KeyUpAction.new(value: key)]
          end

          def pointer_actions(*actions)
            Input::PointerSourceActions.new(
              id: 'mouse',
              parameters: Input::PointerParameters.new(pointer_type: :mouse),
              actions: actions
            )
          end

          def page_y_offset
            driver.execute_script('return window.pageYOffset')
          end

          def selected_file_names
            driver.execute_script("return Array.from(document.getElementById('upload').files, f => f.name)")
          end

          describe '#perform_actions' do
            it 'clicks an element with pointer actions' do
              driver.navigate.to url_for('javascriptPage.html')
              element = shared_reference('#clickField')

              input.perform_actions(
                context: driver.window_handle,
                actions: [
                  pointer_actions(
                    Input::PointerMoveAction.new(x: 0, y: 0, origin: Input::ElementOrigin.new(element: element)),
                    Input::PointerDownAction.new(button: 0),
                    Input::PointerUpAction.new(button: 0)
                  )
                ]
              )

              expect(driver.find_element(id: 'clickField').attribute('value')).to eq('Clicked')
            end

            it 'types into the focused element with key actions' do
              driver.navigate.to url_for('javascriptPage.html')
              driver.find_element(id: 'keyReporter').click

              input.perform_actions(context: driver.window_handle, actions: [key_actions(*press('a'), *press('b'))])

              expect(driver.find_element(id: 'keyReporter').attribute('value')).to eq('ab')
            end

            it 'applies a held modifier key to subsequent key actions' do
              driver.navigate.to url_for('javascriptPage.html')
              driver.find_element(id: 'keyReporter').click

              input.perform_actions(
                context: driver.window_handle,
                actions: [
                  key_actions(
                    Input::KeyDownAction.new(value: Keys[:shift]),
                    *press('a'),
                    Input::KeyUpAction.new(value: Keys[:shift]),
                    *press('b')
                  )
                ]
              )

              expect(driver.find_element(id: 'keyReporter').attribute('value')).to eq('Ab')
            end

            it 'scrolls the page with wheel actions' do
              driver.navigate.to url_for('scroll3.html')
              expect(page_y_offset).to eq(0)

              input.perform_actions(
                context: driver.window_handle,
                actions: [
                  Input::WheelSourceActions.new(
                    id: 'wheel',
                    actions: [Input::WheelScrollAction.new(x: 10, y: 10, delta_x: 0, delta_y: 100, origin: 'viewport')]
                  )
                ]
              )

              wait.until { page_y_offset == 100 }
              expect(page_y_offset).to eq(100)
            end
          end

          describe '#release_actions' do
            it 'releases a pressed pointer button' do
              driver.navigate.to url_for('javascriptPage.html')
              element = shared_reference('#clickField')

              input.perform_actions(
                context: driver.window_handle,
                actions: [
                  pointer_actions(
                    Input::PointerMoveAction.new(x: 0, y: 0, origin: Input::ElementOrigin.new(element: element)),
                    Input::PointerDownAction.new(button: 0)
                  )
                ]
              )
              expect(driver.find_element(id: 'clickField').attribute('value')).to eq('Hello')

              expect(input.release_actions(context: driver.window_handle)).to be_empty

              expect(driver.find_element(id: 'clickField').attribute('value')).to eq('Clicked')
            end

            it 'releases a pressed key and clears its modifier state' do
              driver.navigate.to url_for('javascriptPage.html')
              event_input = driver.find_element(id: 'theworks')
              keylogger = driver.find_element(id: 'result')
              event_input.click

              input.perform_actions(
                context: driver.window_handle,
                actions: [key_actions(Input::KeyDownAction.new(value: Keys[:shift]))]
              )
              wait.until { keylogger.text.include?('keydown') }
              expect(keylogger.text).to match(/keydown *$/)

              expect(input.release_actions(context: driver.window_handle)).to be_empty

              wait.until { keylogger.text.include?('keyup') }
              expect(keylogger.text).to match(/keyup *$/)

              input.perform_actions(context: driver.window_handle, actions: [key_actions(*press('a'))])
              expect(event_input.attribute('value')).to eq('a')
            end
          end

          describe '#set_files',
                   pending_if: {browser: :firefox, platform: :windows,
                                exception: {class: Error::UnsupportedOperationError,
                                            message: /(?:Unrecognized path|Failed to add file)/},
                                reason: 'Firefox rejects the Windows temp file path for input.setFiles'} do
            it 'sets files on a file input element' do
              file = create_tempfile
              driver.navigate.to url_for('upload.html')
              element = shared_reference('#upload')

              expect(driver.find_element(id: 'upload').attribute('value')).to be_empty

              input.set_files(context: driver.window_handle, element: element, files: [file.path])

              expect(driver.find_element(id: 'upload').attribute('value')).not_to be_empty
              driver.find_element(id: 'go').click
              wait.until { driver.find_element(id: 'upload_label').displayed? }
              driver.switch_to.frame('upload_target')
              expect(driver.find_element(tag_name: 'body').text).to include('This is a dummy test file')
            ensure
              file&.close
              file&.unlink
            end

            it 'uploads multiple files set on a multiple file input element' do
              files = [create_tempfile('first bidi upload marker'), create_tempfile('second bidi upload marker')]
              driver.navigate.to url_for('upload_multiple.html')
              element = shared_reference('#upload')

              input.set_files(context: driver.window_handle, element: element, files: files.map(&:path))

              driver.find_element(id: 'go').click
              wait.until { driver.find_element(id: 'upload_label').displayed? }
              driver.switch_to.frame('upload_target')
              wait.until { driver.find_element(tag_name: 'body').text.include?('bidi upload marker') }
              expect(driver.find_element(tag_name: 'body').text)
                .to include('first bidi upload marker', 'second bidi upload marker')
            ensure
              files&.each(&:close)
              files&.each(&:unlink)
            end

            it 'fires a change event on the file input element' do
              file = create_tempfile
              driver.navigate.to url_for('formPage.html')
              element = shared_reference('#upload')

              input.set_files(context: driver.window_handle, element: element, files: [file.path])

              wait.until { driver.find_element(id: 'fileResults').text == 'changed' }
              expect(driver.find_element(id: 'fileResults').text).to eq('changed')
            ensure
              file&.close
              file&.unlink
            end

            it 'clears the selected files with an empty list' do
              file = create_tempfile
              driver.navigate.to url_for('upload.html')
              element = shared_reference('#upload')
              input.set_files(context: driver.window_handle, element: element, files: [file.path])
              expect(selected_file_names).not_to be_empty

              input.set_files(context: driver.window_handle, element: element, files: [])

              expect(selected_file_names).to be_empty
              expect(driver.find_element(id: 'upload').attribute('value')).to be_empty
            ensure
              file&.close
              file&.unlink
            end

            it 'fires a cancel event when the same files are set again' do
              file = create_tempfile
              driver.navigate.to url_for('upload.html')
              element = shared_reference('#upload')
              driver.execute_script(<<~JS)
                window.__fileEvents = [];
                const upload = document.getElementById('upload');
                for (const type of ['change', 'cancel']) {
                  upload.addEventListener(type, () => window.__fileEvents.push(type));
                }
              JS

              input.set_files(context: driver.window_handle, element: element, files: [file.path])
              wait.until { driver.execute_script('return window.__fileEvents') == ['change'] }

              input.set_files(context: driver.window_handle, element: element, files: [file.path])

              wait.until { driver.execute_script('return window.__fileEvents').include?('cancel') }
              expect(driver.execute_script('return window.__fileEvents')).to eq(%w[change cancel])
            ensure
              file&.close
              file&.unlink
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
