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
        describe Session, skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          after { |example| reset_driver!(example: example) }

          let(:session) { described_class.new(driver) }

          describe '#status' do
            it 'returns typed session status' do
              result = session.status

              expect(result).to be_a(Session::StatusResult)
              expect(result.ready).to be(true).or be(false)
              expect(result.message).to be_a(String)
            end
          end

          describe '#subscribe' do
            it 'subscribes to an event globally' do
              result = session.subscribe(events: ['browsingContext.load'])

              expect(result).to be_a(Session::SubscribeResult)
              expect(result.subscription).to be_a(String)
            ensure
              begin
                session.unsubscribe(events: ['browsingContext.load'])
              rescue StandardError
                nil
              end
            end

            it 'subscribes to an event for a context' do
              result = session.subscribe(events: ['browsingContext.load'], contexts: [driver.window_handle])

              expect(result.subscription).to be_a(String)
            ensure
              session.unsubscribe(subscriptions: [result.subscription]) if result&.subscription
            end
          end

          describe '#unsubscribe' do
            it 'unsubscribes by event name' do
              session.subscribe(events: ['browsingContext.load'])

              expect(session.unsubscribe(events: ['browsingContext.load'])).to be_empty
            end

            it 'unsubscribes by subscription id' do
              result = session.subscribe(events: ['browsingContext.load'], contexts: [driver.window_handle])

              expect(session.unsubscribe(subscriptions: [result.subscription])).to be_empty
            end
          end

          describe '#new' do
            it 'is rejected on an already established WebDriver BiDi session' do
              capabilities = Session::CapabilitiesRequest.new(
                always_match: Session::CapabilityRequest.new(
                  accept_insecure_certs: false,
                  unhandled_prompt_behavior: Session::UserPromptHandler.new(default: :dismiss)
                )
              )

              expect { session.new(capabilities: capabilities) }.to raise_error(Error::WebDriverError)
            end
          end

          describe '#end_',
                   pending_if: {browser: :firefox,
                                exception: {class: Error::UnsupportedOperationError,
                                            message: /Ending a session /},
                                reason: 'Firefox returns unsupported operation for session.end on Classic sessions'} do
            it 'ends the active BiDi session' do
              expect(session.end_).to be_empty
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
