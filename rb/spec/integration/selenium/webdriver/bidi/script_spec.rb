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

module Selenium
  module WebDriver
    describe Script, exclusive: {bidi: true, reason: 'only executed when bidi is enabled'},
                     only: {browser: %i[chrome edge firefox]} do
      after { |example| reset_driver!(example: example) }

      # Helper to match the expected pattern of `script.StackFrame` objects.
      # https://w3c.github.io/webdriver-bidi/#type-script-StackFrame
      #
      # Pass in any fields you want to check more specific values for, e.g:
      #   a_stack_frame('functionName' => 'someFunction')
      def a_stack_frame(**options)
        include({
          'columnNumber' => an_instance_of(Integer),
          'functionName' => an_instance_of(String),
          'lineNumber' => an_instance_of(Integer),
          'url' => an_instance_of(String)
        }.merge(options))
      end

      it 'errors when bidi not enabled' do
        reset_driver!(web_socket_url: false) do |driver|
          msg = /BiDi must be enabled by setting #web_socket_url to true in options class/
          expect { driver.script }.to raise_error(WebDriver::Error::WebDriverError, msg)
        end
      end

      it 'logs console messages' do
        driver.navigate.to url_for('bidi/logEntryAdded.html')

        log_entries = []
        driver.script.add_console_message_handler { |log| log_entries << log }

        driver.find_element(id: 'jsException').click
        driver.find_element(id: 'consoleLog').click

        wait.until { log_entries.any? }
        expect(log_entries.size).to eq(1)
        log_entry = log_entries.first
        expect(log_entry).to be_a BiDi::LogHandler::ConsoleLogEntry
        expect(log_entry.type).to eq 'console'
        expect(log_entry.level).to eq 'info'
        expect(log_entry.method).to eq 'log'
        expect(log_entry.text).to eq 'Hello, world!'
        expect(log_entry.args).to eq [
          {'type' => 'string', 'value' => 'Hello, world!'}
        ]
        expect(log_entry.timestamp).to be_an_integer
        expect(log_entry.source).to match(
          'context' => an_instance_of(String),
          'realm' => an_instance_of(String)
        )
        # Stack traces on console messages are optional.
        expect(log_entry.stack_trace).to be_nil.or match(
          # Some browsers include stack traces from parts of the runtime, so we
          # just check the first frames that come from user code.
          'callFrames' => start_with(
            a_stack_frame('functionName' => 'helloWorld'),
            a_stack_frame('functionName' => 'onclick')
          )
        )
      end

      it 'logs multiple console messages' do
        driver.navigate.to url_for('bidi/logEntryAdded.html')

        log_entries = []
        driver.script.add_console_message_handler { |log| log_entries << log }
        driver.script.add_console_message_handler { |log| log_entries << log }

        driver.find_element(id: 'jsException').click
        driver.find_element(id: 'consoleLog').click

        wait.until { log_entries.size > 1 }
        expect(log_entries.size).to eq(2)
      end

      it 'removes console message handler' do
        driver.navigate.to url_for('bidi/logEntryAdded.html')

        log_entries = []
        id = driver.script.add_console_message_handler { |log| log_entries << log }
        driver.script.add_console_message_handler { |log| log_entries << log }

        driver.find_element(id: 'consoleLog').click

        wait.until { log_entries.size > 1 }

        driver.script.remove_console_message_handler(id)

        driver.find_element(id: 'consoleLog').click

        wait.until { log_entries.size > 2 }
        expect(log_entries.size).to eq(3)
      end

      it 'logs javascript errors' do
        driver.navigate.to url_for('bidi/logEntryAdded.html')

        log_entries = []
        driver.script.add_javascript_error_handler { |log| log_entries << log }

        driver.find_element(id: 'consoleLog').click
        driver.find_element(id: 'jsException').click

        wait.until { log_entries.any? }
        expect(log_entries.size).to eq(1)
        log_entry = log_entries.first
        expect(log_entry).to be_a BiDi::LogHandler::JavaScriptLogEntry
        expect(log_entry.type).to eq 'javascript'
        expect(log_entry.level).to eq 'error'
        expect(log_entry.text).to eq 'Error: Not working'
        expect(log_entry.timestamp).to be_an_integer
        expect(log_entry.source).to match(
          'context' => an_instance_of(String),
          'realm' => an_instance_of(String)
        )
        expect(log_entry.stack_trace).to match(
          # Some browsers include stack traces from parts of the runtime, so we
          # just check the first frames that come from user code.
          'callFrames' => start_with(
            a_stack_frame('functionName' => 'createError'),
            a_stack_frame('functionName' => 'onclick')
          )
        )
      end

      it 'errors removing non-existent handler' do
        expect {
          driver.script.remove_console_message_handler(12345)
        }.to raise_error(Error::WebDriverError, /Callback with ID 12345 does not exist/)
      end
    end
  end
end
