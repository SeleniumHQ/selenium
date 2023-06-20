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
      describe NetworkInspector, only: {browser: %i[chrome edge firefox]} do
        let(:empty_page) { '/bidi/emptyPage.html' }
        let(:empty_text) { '/bidi/emptyText.txt' }
        let(:redirected_http_equiv) { '/bidi/redirected_http_equiv.html' }

        it 'can listen to event before request is sent' do
          reset_driver!(web_socket_url: true) do |driver|
            before_request_event = nil
            inspector = described_class.new(driver)
            inspector.before_request_sent { |event| before_request_event = event }

            driver.navigate.to url_for(empty_page)
            wait.until { !before_request_event.nil? }

            expect(before_request_event.dig('request', 'method')).to eq 'GET'
            expect(before_request_event.dig('request', 'url')).to eq driver.current_url
          end
        end

        it 'can request cookies' do
          reset_driver!(web_socket_url: true) do |driver|
            before_request_event = nil
            inspector = described_class.new(driver)
            inspector.before_request_sent { |event| before_request_event = event }

            driver.navigate.to url_for(empty_text)
            driver.manage.add_cookie name: 'north',
                                     value: 'biryani'
            driver.navigate.refresh
            wait.until { !before_request_event.nil? }

            expect(before_request_event.dig('request', 'method')).to eq 'GET'
            expect(before_request_event.dig('request', 'url')).to eq driver.current_url
            expect(before_request_event.dig('request', 'cookies', 0, 'name')).to eq 'north'
            expect(before_request_event.dig('request', 'cookies', 0, 'value')).to eq 'biryani'

            driver.manage.add_cookie name: 'south',
                                     value: 'dosa'
            driver.navigate.refresh
            wait.until { !before_request_event.nil? }
            expect(before_request_event.dig('request', 'cookies', 1, 'name')).to eq 'south'
            expect(before_request_event.dig('request', 'cookies', 1, 'value')).to eq 'dosa'
          end
        end

        it 'can redirect http equiv' do
          reset_driver!(web_socket_url: true) do |driver|
            before_request_event = []
            inspector = described_class.new(driver)
            inspector.before_request_sent { |event| before_request_event.push(event) }

            driver.navigate.to url_for(redirected_http_equiv)
            wait.until { driver.current_url.include? 'redirected.html' }

            expect(before_request_event[0].dig('request', 'method')).to eq 'GET'
            expect(before_request_event[0].dig('request', 'url')).to include 'redirected_http_equiv.html'
            expect(before_request_event[2].dig('request', 'method')).to eq 'GET'
            expect(before_request_event[2].dig('request', 'url')).to include 'redirected.html'
          end
        end

        it 'can subscribe to response started' do
          reset_driver!(web_socket_url: true) do |driver|
            on_response_started = []
            inspector = described_class.new(driver)
            inspector.response_started { |event| on_response_started.push(event) }

            driver.navigate.to url_for(empty_text)
            wait.until { !on_response_started.nil? }

            expect(on_response_started[0].dig('request', 'method')).to eq 'GET'
            expect(on_response_started[0].dig('request', 'url')).to eq driver.current_url
            expect(on_response_started[0].dig('response', 'url')).to eq driver.current_url
            expect(on_response_started[0].dig('response', 'fromCache')).to be false
            expect(on_response_started[0].dig('response', 'mimeType')).to include 'text/plain'
            expect(on_response_started[0].dig('response', 'status')).to eq 200
            expect(on_response_started[0].dig('response', 'statusText')).to eq 'OK'
          end
        end

        it 'test response started mime type' do
          reset_driver!(web_socket_url: true) do |driver|
            on_response_started = []
            inspector = described_class.new(driver)
            inspector.response_started { |event| on_response_started.push(event) }

            # Checking mime type for 'html' text
            driver.navigate.to url_for(empty_page)
            wait.until { !on_response_started.nil? }

            expect(on_response_started[0].dig('request', 'method')).to eq 'GET'
            expect(on_response_started[0].dig('request', 'url')).to eq driver.current_url
            expect(on_response_started[0].dig('response', 'url')).to eq driver.current_url
            expect(on_response_started[0].dig('response', 'mimeType')).to include 'text/html'

            # Checking mime type for 'plain' text
            on_response_started = []
            driver.navigate.to url_for(empty_text)
            wait.until { !on_response_started.nil? }
            expect(on_response_started[0].dig('request', 'method')).to eq 'GET'
            expect(on_response_started[0].dig('request', 'url')).to eq driver.current_url
            expect(on_response_started[0].dig('response', 'url')).to eq driver.current_url
            expect(on_response_started[0].dig('response', 'mimeType')).to include 'text/plain'
          end
        end

        it 'can subscribe to response completed' do
          reset_driver!(web_socket_url: true) do |driver|
            on_response_completed = []
            inspector = described_class.new(driver)
            inspector.response_completed { |event| on_response_completed.push(event) }

            driver.navigate.to url_for(empty_page)
            wait.until { !on_response_completed.nil? }

            expect(on_response_completed[0].dig('request', 'method')).to eq 'GET'
            expect(on_response_completed[0].dig('request', 'url')).to eq driver.current_url
            expect(on_response_completed[0].dig('response', 'url')).to eq driver.current_url
            expect(on_response_completed[0].dig('response', 'fromCache')).to be false
            expect(on_response_completed[0].dig('response', 'mimeType')).to include 'text/html'
            expect(on_response_completed[0].dig('response', 'status')).to eq 200
            expect(on_response_completed[0].dig('response', 'statusText')).to eq 'OK'
            expect(on_response_completed[0]['redirectCount']).to eq 0
          end
        end

        it 'test response completed mime type' do
          reset_driver!(web_socket_url: true) do |driver|
            on_response_completed = []
            inspector = described_class.new(driver)
            inspector.response_completed { |event| on_response_completed.push(event) }

            # Checking mime type for 'html' text
            driver.navigate.to url_for(empty_page)
            wait.until { !on_response_completed.nil? }

            expect(on_response_completed[0].dig('request', 'method')).to eq 'GET'
            expect(on_response_completed[0].dig('request', 'url')).to eq driver.current_url
            expect(on_response_completed[0].dig('response', 'url')).to eq driver.current_url
            expect(on_response_completed[0].dig('response', 'mimeType')).to include 'text/html'

            # Checking mime type for 'plain' text
            on_response_completed = []
            driver.navigate.to url_for(empty_text)
            wait.until { !on_response_completed.nil? }
            expect(on_response_completed[0].dig('request', 'method')).to eq 'GET'
            expect(on_response_completed[0].dig('request', 'url')).to eq driver.current_url
            expect(on_response_completed[0].dig('response', 'url')).to eq driver.current_url
            expect(on_response_completed[0].dig('response', 'mimeType')).to include 'text/plain'
          end
        end
      end
    end
  end
end
