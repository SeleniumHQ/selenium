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

          describe '#perform_actions' do
            it 'clicks an element with pointer actions' do
              driver.navigate.to url_for('javascriptPage.html')
              element = shared_reference('#clickField')

              input.perform_actions(
                context: driver.window_handle,
                actions: [
                  Input::PointerSourceActions.new(
                    id: 'mouse',
                    parameters: Input::PointerParameters.new(pointer_type: :mouse),
                    actions: [
                      Input::PointerMoveAction.new(
                        x: 0,
                        y: 0,
                        origin: Input::ElementOrigin.new(element: element)
                      ),
                      Input::PointerDownAction.new(button: 0),
                      Input::PointerUpAction.new(button: 0)
                    ]
                  )
                ]
              )

              expect(driver.find_element(id: 'clickField').attribute('value')).to eq('Clicked')
            end
          end

          describe '#release_actions' do
            it 'releases active input sources' do
              driver.navigate.to url_for('javascriptPage.html')
              element = shared_reference('#clickField')

              input.perform_actions(
                context: driver.window_handle,
                actions: [
                  Input::PointerSourceActions.new(
                    id: 'mouse',
                    parameters: Input::PointerParameters.new(pointer_type: :mouse),
                    actions: [
                      Input::PointerMoveAction.new(x: 0, y: 0, origin: Input::ElementOrigin.new(element: element)),
                      Input::PointerDownAction.new(button: 0)
                    ]
                  )
                ]
              )

              expect(input.release_actions(context: driver.window_handle)).to be_empty
            end
          end

          describe '#set_files',
                   pending_if: {browser: :firefox,
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
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
