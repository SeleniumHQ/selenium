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
      describe LogInspector, exclusive: {bidi: true, reason: 'only executed when bidi is enabled'},
                             only: {browser: %i[chrome edge firefox]} do
        let(:page) { 'bidi/logEntryAdded.html' }

        it 'can listen to console log' do
          log_entries = []
          log_inspector = described_class.new(driver)
          log_inspector.on_console_entry { |log| log_entries << log }

          driver.navigate.to url_for(page)
          driver.find_element(id: 'consoleLog').click
          log_entry = wait.until { log_entries.find { _1.text == 'Hello, world!' } }

          expect(log_entry).to have_attributes(
            text: 'Hello, world!',
            realm: nil,
            type: 'console',
            level: LogInspector::LOG_LEVEL[:INFO],
            method: 'log',
            args: [{
              'type' => 'string',
              'value' => 'Hello, world!'
            }]
          )
        end

        it 'can listen to console log with different consumers' do
          log_entries1 = []
          log_entries2 = []
          log_inspector = described_class.new(driver)
          log_inspector.on_console_entry { |log| log_entries1 << log }
          log_inspector.on_console_entry { |log| log_entries2 << log }

          driver.navigate.to url_for(page)
          driver.find_element(id: 'consoleLog').click
          log_entry1 = wait.until { log_entries1.find { _1.text == 'Hello, world!' } }
          log_entry2 = wait.until { log_entries2.find { _1.text == 'Hello, world!' } }

          expect([log_entry1, log_entry2]).to all(
            have_attributes(
              text: 'Hello, world!',
              realm: nil,
              type: 'console',
              level: LogInspector::LOG_LEVEL[:INFO],
              method: 'log',
              args: [{
                'type' => 'string',
                'value' => 'Hello, world!'
              }]
            )
          )
        end

        it 'can filter console info level log' do
          log_entries = []
          log_inspector = described_class.new(driver)
          log_inspector.on_console_entry(FilterBy.log_level('info')) { |log| log_entries << log }

          driver.navigate.to url_for(page)
          driver.find_element(id: 'consoleLog').click
          log_entry = wait.until { log_entries.find { _1.text == 'Hello, world!' } }

          expect(log_entry).to have_attributes(
            text: 'Hello, world!',
            realm: nil,
            type: 'console',
            level: LogInspector::LOG_LEVEL[:INFO],
            method: 'log',
            args: [{
              'type' => 'string',
              'value' => 'Hello, world!'
            }]
          )
        end

        it 'can filter console log' do
          log_entries = []
          log_inspector = described_class.new(driver)
          log_inspector.on_console_entry(FilterBy.log_level('error')) { |log| log_entries << log }

          driver.navigate.to url_for(page)
          # Generating info level log but we are filtering by error level
          wait.until { driver.find_element(id: 'consoleLog').displayed? }
          driver.find_element(id: 'consoleLog').click

          expect(log_entries).to be_empty
        end

        it 'can listen to javascript log' do
          log_entry = nil
          log_inspector = described_class.new(driver)
          log_inspector.on_javascript_log { |log| log_entry = log }

          driver.navigate.to url_for(page)
          driver.find_element(id: 'jsException').click
          wait.until { !log_entry.nil? }

          expect(log_entry).to have_attributes(
            text: 'Error: Not working',
            type: 'javascript',
            level: LogInspector::LOG_LEVEL[:ERROR]
          )
        end

        it 'can filter javascript log at error level' do
          log_entry = nil
          log_inspector = described_class.new(driver)
          log_inspector.on_javascript_log(FilterBy.log_level('error')) { |log| log_entry = log }

          driver.navigate.to url_for(page)
          driver.find_element(id: 'jsException').click
          wait.until { !log_entry.nil? }

          expect(log_entry).to have_attributes(
            text: 'Error: Not working',
            type: 'javascript',
            level: LogInspector::LOG_LEVEL[:ERROR]
          )
        end

        it 'can filter javascript log' do
          log_entry = nil
          log_inspector = described_class.new(driver)
          log_inspector.on_javascript_log(FilterBy.log_level('info')) { |log| log_entry = log }

          driver.navigate.to url_for(page)
          # Generating js error level log but we are filtering by info level
          wait.until { driver.find_element(id: 'jsException').displayed? }
          driver.find_element(id: 'jsException').click

          expect(log_entry).to be_nil
        end

        it 'can listen to javascript error log' do
          log_entry = nil
          log_inspector = described_class.new(driver)
          log_inspector.on_javascript_exception { |log| log_entry = log }

          driver.navigate.to url_for(page)
          driver.find_element(id: 'jsException').click
          wait.until { !log_entry.nil? }

          expect(log_entry).to have_attributes(
            text: 'Error: Not working',
            type: 'javascript',
            level: LogInspector::LOG_LEVEL[:ERROR]
          )
        end

        it 'can listen to any log' do
          log_entries = []
          log_inspector = described_class.new(driver)
          log_inspector.on_log { |log| log_entries << log }

          driver.navigate.to url_for(page)
          driver.find_element(id: 'consoleError').click
          log_entry = wait.until { log_entries.find { _1['text'] == 'I am console error' } }

          expect(log_entry).to include(
            'text' => 'I am console error',
            'type' => 'console',
            'level' => LogInspector::LOG_LEVEL[:ERROR]
          )
        end

        it 'can filter any log' do
          log_entries = []
          log_inspector = described_class.new(driver)
          log_inspector.on_log(FilterBy.log_level('info')) { |log| log_entries << log }

          driver.navigate.to url_for(page)
          driver.find_element(id: 'consoleLog').click
          log_entry = wait.until { log_entries.find { _1['text'] == 'Hello, world!' } }

          expect(log_entry['text']).to eq('Hello, world!')
          expect(log_entry['realm']).to be_nil
          expect(log_entry['type']).to eq('console')
          expect(log_entry['level']).to eq('info')
          expect(log_entry['method']).to eq('log')
          expect(log_entry['args'].size).to eq(1)
        end

        it 'can filter any log at error level' do
          log_entry = nil
          log_inspector = described_class.new(driver)
          log_inspector.on_log(FilterBy.log_level('error')) { |log| log_entry = log }

          driver.navigate.to url_for(page)
          driver.find_element(id: 'jsException').click
          wait.until { !log_entry.nil? }

          expect(log_entry['text']).to eq('Error: Not working')
          expect(log_entry['type']).to eq('javascript')
          expect(log_entry['level']).to eq('error')
        end

        it 'can retrieve stack trace for a log' do
          log_entry = nil
          log_inspector = described_class.new(driver)
          log_inspector.on_javascript_log { |log| log_entry = log }

          driver.navigate.to url_for(page)
          driver.find_element(id: 'jsException').click
          wait.until { !log_entry.nil? }

          stack_trace = log_entry.stack_trace

          expect(stack_trace).not_to be_nil
        end
      end
    end
  end
end
