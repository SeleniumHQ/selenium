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
    describe DevTools, only: {driver: %i[chrome edge]} do
      let(:username) { SpecSupport::RackServer::TestApp::BASIC_AUTH_CREDENTIALS.first }
      let(:password) { SpecSupport::RackServer::TestApp::BASIC_AUTH_CREDENTIALS.last }

      after do
        quit_driver
      end

      it 'sends commands' do
        driver.devtools.page.navigate(url: url_for('xhtmlTest.html'))
        expect(driver.title).to eq("XHTML Test Page")
      end

      it 'supports events' do
        callback = instance_double(Proc, call: nil)

        driver.devtools.page.enable
        driver.devtools.page.on(:load_event_fired) { callback.call }
        driver.navigate.to url_for('xhtmlTest.html')

        expect(callback).to have_received(:call)
      end

      it 'authenticates on any request' do
        driver.register(username: username, password: password)

        driver.navigate.to url_for('basicAuth')
        expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
      end

      it 'authenticates based on URL' do
        auth_url = url_for('basicAuth')
        driver.register(username: username, password: password, uri: /localhost/)

        driver.navigate.to auth_url.sub('localhost', '127.0.0.1')
        expect { driver.find_element(tag_name: 'h1') }.to raise_error(Error::NoSuchElementError)

        driver.navigate.to auth_url
        expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
      end
    end
  end
end
