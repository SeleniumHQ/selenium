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
      describe 'cookie management' do
        after { driver.manage.delete_all_cookies }

        it 'should show http only when insecure' do
          driver.navigate.to url_for('xhtmlTest.html')
          driver.manage.add_cookie name: 'security',
                                   value: 'insecure',
                                   http_only: true

          expect(driver.manage.cookie_named('security')[:http_only]).to eq true
        end

        it 'should not add secure when http', except: {browser: :firefox,
                                                       reason: 'https://github.com/mozilla/geckodriver/issues/1840'} do
          driver.navigate.to url_for('xhtmlTest.html')
          driver.manage.add_cookie name: 'security',
                                   value: 'secure',
                                   secure: true

          cookies = driver.manage.all_cookies
          expect(cookies.size).to eq(0)
        end

        it 'should respect path' do
          driver.navigate.to url_for('xhtmlTest.html')
          driver.manage.add_cookie name: 'path',
                                   value: 'specified',
                                   path: '/child'
          cookies = driver.manage.all_cookies
          expect(cookies.size).to eq(0)

          driver.navigate.to url_for('child/childPage.html')
          expect(driver.manage.cookie_named('path')[:path]).to eq '/child'
        end

        it 'should add expiration with DateTime' do
          driver.navigate.to url_for('xhtmlTest.html')

          expected = (Date.today + 2).to_datetime
          driver.manage.add_cookie name: 'expiration',
                                   value: 'datetime',
                                   expires: expected

          actual = driver.manage.cookie_named('expiration')[:expires]
          expect(actual).to be_kind_of(DateTime)
          expect(actual).to eq(expected)
        end

        it 'should add expiration with Time' do
          driver.navigate.to url_for('xhtmlTest.html')

          expected = (Date.today + 2).to_datetime
          driver.manage.add_cookie name: 'expiration',
                                   value: 'time',
                                   expires: expected.to_time

          actual = driver.manage.cookie_named('expiration')[:expires]
          expect(actual).to be_kind_of(DateTime)
          expect(actual).to eq(expected)
        end

        it 'should add expiration with Number' do
          driver.navigate.to url_for('xhtmlTest.html')

          expected = (Date.today + 2).to_datetime
          driver.manage.add_cookie name: 'expiration',
                                   value: 'number',
                                   expires: expected.to_time.to_f

          actual = driver.manage.cookie_named('expiration')[:expires]
          expect(actual).to be_kind_of(DateTime)
          expect(actual).to eq(expected)
        end

        it 'should add sameSite cookie with attribute Strict', only: {browser: %i[chrome edge firefox]} do
          driver.navigate.to url_for('xhtmlTest.html')
          driver.manage.add_cookie name: 'samesite', value: 'strict', same_site: 'Strict'

          expect(driver.manage.cookie_named('samesite')[:same_site]).to eq('Strict')
        end

        it 'should add sameSite cookie with attribute Lax', only: {browser: %i[chrome edge firefox]} do
          driver.navigate.to url_for('xhtmlTest.html')
          driver.manage.add_cookie name: 'samesite',
                                   value: 'lax',
                                   same_site: 'Lax'
          expect(driver.manage.cookie_named('samesite')[:same_site]).to eq('Lax')
        end

        it 'should get one' do
          driver.navigate.to url_for('xhtmlTest.html')
          driver.manage.add_cookie name: 'foo', value: 'bar'

          expect(driver.manage.cookie_named('foo')[:value]).to eq('bar')
        end

        it 'should get all' do
          driver.navigate.to url_for('xhtmlTest.html')
          driver.manage.add_cookie name: 'foo', value: 'bar'

          cookies = driver.manage.all_cookies

          expect(cookies.size).to eq(1)
          expect(cookies.first[:name]).to eq('foo')
          expect(cookies.first[:value]).to eq('bar')
        end

        it 'should delete one' do
          driver.navigate.to url_for('xhtmlTest.html')
          driver.manage.add_cookie name: 'foo', value: 'bar'

          driver.manage.delete_cookie('foo')
          expect(driver.manage.all_cookies.find { |c| c[:name] == 'foo' }).to be_nil
        end

        it 'should delete all' do
          driver.navigate.to url_for('xhtmlTest.html')

          driver.manage.add_cookie name: 'foo', value: 'bar'
          driver.manage.add_cookie name: 'bar', value: 'foo'
          driver.manage.delete_all_cookies
          expect(driver.manage.all_cookies).to be_empty
        end
      end

      describe 'new_window' do
        after { ensure_single_window }

        types = %i[tab window]
        types.each do |type|
          it "should be able to open a new #{type}" do
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
