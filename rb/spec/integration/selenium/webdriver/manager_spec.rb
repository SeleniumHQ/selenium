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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe Manager do
      describe 'logs', except: [{browser: %i[edge edge_chrome firefox ie safari safari_preview]},
                                {driver: :remote, browser: :chrome}] do
        it 'can fetch remote log types', only: {driver: :remote} do
          expect(driver.manage.logs.available_types).to include(:server, :browser, :driver)
        end

        it 'can fetch available log types', except: {driver: :remote} do
          expect(driver.manage.logs.available_types).to include(:browser, :driver)
          expect(driver.manage.logs.available_types).not_to include(:server)
        end

        it 'can get the browser log' do
          driver.navigate.to url_for('errors.html')
          driver.find_element(tag_name: 'input').click

          entries = driver.manage.logs.get(:browser)
          expect(entries).not_to be_empty
          expect(entries.first).to be_kind_of(LogEntry)
        end

        # Chrome - turned off by default
        it 'can get the driver log', except: {browser: %i[chrome edge_chrome]} do
          driver.navigate.to url_for('simpleTest.html')

          entries = driver.manage.logs.get(:driver)
          expect(entries).not_to be_empty
          expect(entries.first).to be_kind_of(LogEntry)
        end
      end

      describe 'cookie management' do
        it 'should get all' do
          driver.navigate.to url_for('xhtmlTest.html')
          driver.manage.add_cookie name: 'foo', value: 'bar'

          cookies = driver.manage.all_cookies

          expect(cookies.size).to eq(1)
          expect(cookies.first[:name]).to eq('foo')
          expect(cookies.first[:value]).to eq('bar')
        end

        it 'should get named cookie' do
          driver.navigate.to url_for('xhtmlTest.html')
          driver.manage.add_cookie name: 'foo', value: 'bar'

          expect(driver.manage.cookie_named('foo')[:value]).to eq('bar')
        end

        # Edge BUG - https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/5751773/
        it 'should delete one', except: {browser: :edge} do
          driver.navigate.to url_for('xhtmlTest.html')
          driver.manage.add_cookie name: 'foo', value: 'bar'

          driver.manage.delete_cookie('foo')
          expect(driver.manage.all_cookies.find { |c| c[:name] == 'foo' }).to be_nil
        end

        it 'should delete all', except: {browser: :edge} do
          driver.navigate.to url_for('xhtmlTest.html')

          driver.manage.add_cookie name: 'foo', value: 'bar'
          driver.manage.add_cookie name: 'bar', value: 'foo'
          driver.manage.delete_all_cookies
          expect(driver.manage.all_cookies).to be_empty
        end

        it 'should use DateTime for expires' do
          driver.navigate.to url_for('xhtmlTest.html')

          expected = (Date.today + 2).to_datetime
          driver.manage.add_cookie name: 'foo',
                                   value: 'bar',
                                   expires: expected

          actual = driver.manage.cookie_named('foo')[:expires]
          expect(actual).to be_kind_of(DateTime)
          expect(actual).to eq(expected)
        end
      end

      describe 'new_window' do
        after { ensure_single_window }

        types = %i[tab window]
        types.each do |type|
          it "should be able to open a new #{type}", only: {browser: %i[safari_preview firefox ie]} do
            before_window_handles = driver.window_handles.length
            driver.manage.new_window(type)
            expect(driver.window_handles.length).to eq(before_window_handles + 1)
          end
        end

        it "returns an exception if an invalid type is provided" do
          invalid_types = [:invalid, 'invalid', 'tab', 'window']
          invalid_types.each do |type|
            expect { driver.manage.new_window(type) }.to \
              raise_error(ArgumentError, "invalid argument for type. Got: '#{type.inspect}'. Try :tab or :window")
          end
        end
      end
    end # Options
  end # WebDriver
end # Selenium
