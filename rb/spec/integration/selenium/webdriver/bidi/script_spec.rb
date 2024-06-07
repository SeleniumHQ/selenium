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
        expect(log_entry.level).to eq 'info'
        expect(log_entry.method).to eq 'log'
        expect(log_entry.text).to eq 'Hello, world!'
        expect(log_entry.type).to eq 'console'
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
        expect(log_entry.level).to eq 'error'
        expect(log_entry.type).to eq 'javascript'
        expect(log_entry.text).to eq 'Error: Not working'
        expect(log_entry.stack_trace).not_to be_empty
      end

      it 'errors removing non-existent handler' do
        expect {
          driver.script.remove_console_message_handler(12345)
        }.to raise_error(Error::WebDriverError, /Callback with ID 12345 does not exist/)
      end
    end
  end
end
