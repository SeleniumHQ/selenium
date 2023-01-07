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
    class BiDi
      describe LogInspector, exclusive: {browser: %i[chrome firefox]} do
        before do
          @page = '/bidi/logEntryAdded.html'
        end

        it 'can listen to console log' do
          reset_driver!(web_socket_url: true) do |driver|
            log_entry = nil
            log_inspector = described_class.new(driver)
            log_inspector.on_console_entry { |log| log_entry = log }

            driver.navigate.to url_for(@page)
            driver.find_element(id: 'consoleLog').click
            wait.until { !log_entry.nil? }

            expect(log_entry).to have_attributes(
              text: 'Hello, world!',
              realm: nil,
              type: 'console',
              level: LogInspector::LOG_LEVEL[:INFO],
              method: 'log',
              stack_trace: nil
            )
            expect(log_entry.args.size).to eq(1)
          end
        end

        it 'can listen to javascript log' do
          reset_driver!(web_socket_url: true) do |driver|
            log_entry = nil
            log_inspector = described_class.new(driver)
            log_inspector.on_javascript_log { |log| log_entry = log }

            driver.navigate.to url_for(@page)
            driver.find_element(id: 'jsException').click
            wait.until { !log_entry.nil? }

            expect(log_entry).to have_attributes(
              text: 'Error: Not working',
              type: 'javascript',
              level: LogInspector::LOG_LEVEL[:ERROR]
            )
          end
        end

        it 'can listen to javascript error log' do
          reset_driver!(web_socket_url: true) do |driver|
            log_entry = nil
            log_inspector = described_class.new(driver)
            log_inspector.on_javascript_exception { |log| log_entry = log }

            driver.navigate.to url_for(@page)
            driver.find_element(id: 'jsException').click
            wait.until { !log_entry.nil? }

            expect(log_entry).to have_attributes(
              text: 'Error: Not working',
              type: 'javascript',
              level: LogInspector::LOG_LEVEL[:ERROR]
            )
          end
        end

        it 'can listen to any log' do
          reset_driver!(web_socket_url: true) do |driver|
            log_entry = nil
            log_inspector = described_class.new(driver)
            log_inspector.on_log { |log| log_entry = log }

            driver.navigate.to url_for(@page)
            driver.find_element(id: 'consoleError').click
            wait.until { !log_entry.nil? }

            expect(log_entry['text']).to eq('I am console error')
            expect(log_entry['type']).to eq('console')
            expect(log_entry['method']).to eq(LogInspector::LOG_LEVEL[:ERROR])
          end
        end

        it 'can retrieve stack trace for a log' do
          reset_driver!(web_socket_url: true) do |driver|
            log_entry = nil
            log_inspector = described_class.new(driver)
            log_inspector.on_javascript_log { |log| log_entry = log }

            driver.navigate.to url_for(@page)
            driver.find_element(id: 'jsException').click
            wait.until { !log_entry.nil? }

            stack_trace = log_entry.stack_trace

            expect(stack_trace).not_to be_nil
            expect(stack_trace['callFrames'].size).to eq(3)
          end
        end
      end
    end
  end
end
