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
        before { driver.navigate.to url_for('xhtmlTest.html') }

        after { driver.manage.delete_all_cookies }

        it 'should set correct defaults' do
          driver.manage.add_cookie name: 'default',
                                   value: 'value'

          cookie = driver.manage.cookie_named('default')
          expect(cookie[:value]).to eq('value')
          expect(cookie[:path]).to eq('/')
          expect(cookie[:domain]).to eq('localhost')
          expect(cookie[:http_only]).to eq(false)
          expect(cookie[:secure]).to eq(false)
        end

        it 'should set samesite property of Default by default',
           only: {browser: %i[chrome edge firefox]},
           except: [{browser: %i[chrome edge],
                     reason: 'https://bugs.chromium.org/p/chromedriver/issues/detail?id=3732'},
                    {browser: :firefox,
                     reason: 'https://github.com/mozilla/geckodriver/issues/1841'}] do
          driver.manage.add_cookie name: 'samesite',
                                   value: 'default'

          expect(driver.manage.cookie_named('samesite')[:same_site]).to eq('Default')
        end

        it 'should respect path' do
          driver.manage.add_cookie name: 'path',
                                   value: 'specified',
                                   path: '/child'

          expect(driver.manage.all_cookies.size).to eq(0)

          driver.navigate.to url_for('child/childPage.html')

          expect(driver.manage.cookie_named('path')[:path]).to eq '/child'
        end

        it 'should respect setting on domain from a subdomain',
           exclusive: {driver: :none,
                       reason: "Can only be tested on site with subdomains"} do
          driver.get("https://opensource.saucelabs.com")

          driver.manage.add_cookie name: 'domain',
                                   value: 'specified',
                                   domain: 'saucelabs.com'

          expect(driver.manage.cookie_named('domain')[:domain]).to eq('.saucelabs.com')

          driver.get("https://accounts.saucelabs.com")
          expect(driver.manage.cookie_named('domain')[:domain]).to eq('.saucelabs.com')

          driver.get("https://saucelabs.com")
          expect(driver.manage.cookie_named('domain')[:domain]).to eq('.saucelabs.com')
        end

        it 'should not allow domain to be set for localhost',
           exclude: [{browser: %i[chrome edge],
                      reason: "https://bugs.chromium.org/p/chromedriver/issues/detail?id=3733"}],
           except: {browser: %i[safari safari_preview]} do
          expect {
            driver.manage.add_cookie name: 'domain',
                                     value: 'localhost',
                                     domain: 'localhost'
          }.to raise_error(Error::UnableToSetCookieError)
        end

        it 'should not allow setting on a different domain', except: {browser: %i[safari safari_preview]} do
          expect {
            driver.manage.add_cookie name: 'domain',
                                     value: 'different',
                                     domain: 'selenium.dev'
          }.to raise_error(Error::InvalidCookieDomainError)
        end

        it 'should not allow setting on a subdomain from parent domain',
           exclusive: {driver: :none,
                       reason: "Can only be tested on site with subdomains"},
           except: {browser: :chrome,
                    reason: 'https://bugs.chromium.org/p/chromedriver/issues/detail?id=3734'} do
          driver.get("https://saucelabs.com")

          expect {
            driver.manage.add_cookie name: 'domain',
                                     value: 'subdomain',
                                     domain: 'opensource.saucelabs.com'
          }.to raise_exception(Error::InvalidCookieDomainError)
        end

        it 'should not be visible to javascript when http_only is true' do
          driver.manage.add_cookie name: 'httponly',
                                   value: 'true',
                                   http_only: true

          expect(driver.execute_script("return document.cookie")).to be_empty
          expect(driver.manage.cookie_named('httponly')[:http_only]).to eq true
        end

        it 'should not add secure cookie when http',
           except: [{browser: %i[firefox firefox_nightly],
                     reason: 'https://github.com/mozilla/geckodriver/issues/1840'},
                    {browser: :chrome,
                     reason: 'https://bugs.chromium.org/p/chromium/issues/detail?id=1177877#c7'}] do
          driver.manage.add_cookie name: 'secure',
                                   value: 'http',
                                   secure: true

          expect(driver.manage.all_cookies.size).to eq(0)
        end

        it 'should add secure cookie when https',
           exclusive: {driver: :none,
                       reason: "Can only be tested on https site"} do
          driver.get 'https://www.selenium.dev'

          driver.manage.add_cookie name: 'secure',
                                   value: 'https',
                                   secure: true

          expect(driver.manage.cookie_named('secure')[:secure]).to eq(true)
        end

        context 'sameSite' do
          it 'should allow adding with value Strict', only: {browser: %i[chrome edge firefox firefox_nightly]} do
            driver.manage.add_cookie name: 'samesite',
                                     value: 'strict',
                                     same_site: 'Strict'

            expect(driver.manage.cookie_named('samesite')[:same_site]).to eq('Strict')
          end

          it 'should allow adding with value Lax', only: {browser: %i[chrome edge firefox firefox_nightly]} do
            driver.manage.add_cookie name: 'samesite',
                                     value: 'lax',
                                     same_site: 'Lax'
            expect(driver.manage.cookie_named('samesite')[:same_site]).to eq('Lax')
          end

          it 'should allow adding with value None',
             exclusive: {driver: :none,
                         reason: "Can only be tested on https site"} do
            driver.get 'https://selenium.dev'

            driver.manage.add_cookie name: 'samesite',
                                     value: 'none-secure',
                                     same_site: 'None',
                                     secure: true

            expect(driver.manage.cookie_named('samesite')[:same_site]).to eq('None')
          end

          it 'should not allow adding with value None when secure is false',
             except: [{browser: %i[firefox firefox_nightly],
                       reason: "https://github.com/mozilla/geckodriver/issues/1842"},
                      {browser: %i[safari safari_preview]}] do
            expect {
              driver.manage.add_cookie name: 'samesite',
                                       value: 'none-insecure',
                                       same_site: 'None',
                                       secure: false
            }.to raise_exception(Error::UnableToSetCookieError)
          end
        end

        context 'expiration' do
          it 'should allow adding with DateTime value' do
            expected = (Date.today + 2).to_datetime
            driver.manage.add_cookie name: 'expiration',
                                     value: 'datetime',
                                     expires: expected

            actual = driver.manage.cookie_named('expiration')[:expires]
            expect(actual).to be_kind_of(DateTime)
            expect(actual).to eq(expected)
          end

          it 'should allow adding with Time value' do
            expected = (Date.today + 2).to_datetime
            driver.manage.add_cookie name: 'expiration',
                                     value: 'time',
                                     expires: expected.to_time

            actual = driver.manage.cookie_named('expiration')[:expires]
            expect(actual).to be_kind_of(DateTime)
            expect(actual).to eq(expected)
          end

          it 'should allow adding with Number value' do
            expected = (Date.today + 2).to_datetime
            driver.manage.add_cookie name: 'expiration',
                                     value: 'number',
                                     expires: expected.to_time.to_f

            actual = driver.manage.cookie_named('expiration')[:expires]
            expect(actual).to be_kind_of(DateTime)
            expect(actual).to eq(expected)
          end

          it 'should not allow adding when value is in the past' do
            expected = (Date.today - 2).to_datetime
            driver.manage.add_cookie name: 'expiration',
                                     value: 'datetime',
                                     expires: expected

            expect(driver.manage.all_cookies.size).to eq(0)
          end
        end

        it 'should get one' do
          driver.manage.add_cookie name: 'foo', value: 'bar'

          expect(driver.manage.cookie_named('foo')[:value]).to eq('bar')
        end

        it 'should get all' do
          driver.manage.add_cookie name: 'foo', value: 'bar'

          cookies = driver.manage.all_cookies

          expect(cookies.size).to eq(1)
          expect(cookies.first[:name]).to eq('foo')
          expect(cookies.first[:value]).to eq('bar')
        end

        it 'should delete one' do
          driver.manage.add_cookie name: 'foo', value: 'bar'

          driver.manage.delete_cookie('foo')
          expect(driver.manage.all_cookies.find { |c| c[:name] == 'foo' }).to be_nil
        end

        it 'should delete all' do
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
