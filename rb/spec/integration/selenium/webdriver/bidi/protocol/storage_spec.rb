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
require 'uri'

module Selenium
  module WebDriver
    class BiDi
      module Protocol
        describe Storage,
                 pending_if: {browser_family: :safari,
                              exception: {class: Error::UnknownCommandError,
                                          message: /(?:Module storage does not exist|storage\.)/},
                              reason: 'Safari driver currently returns unknown command for BiDi storage commands'},
                 skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          after { |example| reset_driver!(example: example) }

          let(:storage) { described_class.new(driver) }

          def cookie_domain
            URI(driver.current_url).host
          end

          def cookie_value(value)
            Network::StringValue.new(value: value)
          end

          def partial_cookie(name, value, **options)
            Storage::PartialCookie.new(name: name, value: cookie_value(value), domain: cookie_domain, **options)
          end

          before do
            driver.navigate.to url_for('ajaxy_page.html')
            driver.manage.delete_all_cookies
          end

          describe '#set_cookie' do
            it 'sets a cookie that can be read by name' do
              result = storage.set_cookie(cookie: partial_cookie('ruby-bidi-cookie', 'test-value'))

              cookies = storage.get_cookies(
                filter: Storage::CookieFilter.new(name: 'ruby-bidi-cookie')
              ).cookies

              expect(result.partition_key).to be_a(Storage::PartitionKey)
              expect(cookies.map(&:name)).to include('ruby-bidi-cookie')
              expect(cookies.find { |cookie| cookie.name == 'ruby-bidi-cookie' }.value.value).to eq('test-value')
            end

            it 'sets a cookie with optional attributes and a context partition' do
              partition = Storage::BrowsingContextPartitionDescriptor.new(context: driver.window_handle)
              expiry = Time.now.to_i + 3600

              result = storage.set_cookie(
                cookie: partial_cookie(
                  'ruby-bidi-partitioned-cookie',
                  'partitioned',
                  path: '/',
                  http_only: true,
                  secure: false,
                  same_site: :lax,
                  expiry: expiry
                ),
                partition: partition
              )

              cookies = storage.get_cookies(
                filter: Storage::CookieFilter.new(name: 'ruby-bidi-partitioned-cookie'),
                partition: partition
              ).cookies

              expect(result.partition_key).to be_a(Storage::PartitionKey)
              expect(cookies.first.value.value).to eq('partitioned')
              expect(cookies.first.http_only).to be(true)
              expect(cookies.first.same_site).to eq(:lax)
            end
          end

          describe '#get_cookies' do
            it 'returns matching cookies and the partition key' do
              storage.set_cookie(cookie: partial_cookie('ruby-bidi-filter-cookie', 'filter-value'))

              result = storage.get_cookies(filter: Storage::CookieFilter.new(domain: cookie_domain))

              expect(result).to be_a(Storage::GetCookiesResult)
              expect(result.partition_key).to be_a(Storage::PartitionKey)
              expect(result.cookies.map(&:name)).to include('ruby-bidi-filter-cookie')
            end

            it 'returns an empty list when no cookies match the filter' do
              result = storage.get_cookies(filter: Storage::CookieFilter.new(name: 'missing-ruby-bidi-cookie'))

              expect(result.cookies).to be_empty
            end
          end

          describe '#delete_cookies' do
            it 'deletes a single matching cookie' do
              storage.set_cookie(cookie: partial_cookie('ruby-bidi-delete-me', 'delete'))
              storage.set_cookie(cookie: partial_cookie('ruby-bidi-keep-me', 'keep'))

              result = storage.delete_cookies(filter: Storage::CookieFilter.new(name: 'ruby-bidi-delete-me'))

              expect(result.partition_key).to be_a(Storage::PartitionKey)
              deleted_cookies = storage.get_cookies(
                filter: Storage::CookieFilter.new(name: 'ruby-bidi-delete-me')
              ).cookies
              kept_cookies = storage.get_cookies(
                filter: Storage::CookieFilter.new(name: 'ruby-bidi-keep-me')
              ).cookies

              expect(deleted_cookies).to be_empty
              expect(kept_cookies).not_to be_empty
            end

            it 'accepts a partition descriptor' do
              partition = Storage::BrowsingContextPartitionDescriptor.new(context: driver.window_handle)
              storage.set_cookie(cookie: partial_cookie('ruby-bidi-context-cookie', 'context'), partition: partition)

              result = storage.delete_cookies(
                filter: Storage::CookieFilter.new(name: 'ruby-bidi-context-cookie'),
                partition: partition
              )

              expect(result.partition_key).to be_a(Storage::PartitionKey)
              expect(storage.get_cookies(
                filter: Storage::CookieFilter.new(name: 'ruby-bidi-context-cookie'),
                partition: partition
              ).cookies).to be_empty
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
