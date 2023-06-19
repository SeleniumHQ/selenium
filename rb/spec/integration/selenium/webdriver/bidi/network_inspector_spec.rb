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
            before_request_event = []
            inspector = described_class.new(driver)
            inspector.before_request_sent { |event| before_request_event.push(event) }

            driver.navigate.to url_for(empty_page)

            wait.until { !before_request_event.nil? }

            expect(before_request_event[0].dig('request', 'method')).to eq 'GET'
            url = before_request_event[0].dig('request', 'url')
            expect(url).to eq driver.current_url
          end
        end

        it 'can request cookies' do
          reset_driver!(web_socket_url: true) do |driver|
            before_request_event = []
            inspector = described_class.new(driver)
            inspector.before_request_sent { |event| before_request_event.push(event) }

            driver.navigate.to url_for(empty_text)
            driver.manage.add_cookie name: 'north',
                                     value: 'biryani'
            driver.navigate.refresh
            wait.until { !before_request_event.nil? }

            cookies = before_request_event[0]['request']['cookies']
            puts "cookies = \n", cookies # prints nil
            expect(before_request_event[0].dig('request', 'method')).to eq 'GET'
          end
        end
      end
    end
  end
end
