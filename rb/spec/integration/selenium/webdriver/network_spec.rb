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
require 'selenium/webdriver/bidi/protocol'

module Selenium
  module WebDriver
    describe Network, skip_if: {browser_family: :safari,
                                reason: 'Safari does not support BiDi network interception'},
                      skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
      let(:username) { SpecSupport::RackServer::TestApp::BASIC_AUTH_CREDENTIALS.first }
      let(:password) { SpecSupport::RackServer::TestApp::BASIC_AUTH_CREDENTIALS.last }

      # The request and response handler examples still count Network#callbacks, which is deprecated
      before do
        allow(WebDriver.logger).to receive(:deprecate).and_call_original
        allow(WebDriver.logger).to receive(:deprecate).with('Network#callbacks', any_args)
      end

      it 'answers a challenge with credentials' do
        driver = local_driver(web_socket_url: true)
        driver.network.add_authentication(username: username, password: password)

        driver.navigate.to url_for('basicAuth')

        expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
      end

      it 'answers a challenge from a handler for the URLs it applies to' do
        driver = local_driver(web_socket_url: true)
        driver.network.add_authentication_handler(url_patterns: url_for('basicAuth')) do |challenge|
          challenge.authenticate(username: username, password: password)
        end

        driver.navigate.to url_for('basicAuth')

        expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
      end

      it 'cancels a challenge' do
        driver = local_driver(web_socket_url: true)
        driver.network.add_authentication_handler(&:cancel)

        driver.navigate.to url_for('basicAuth')

        expect(driver.find_element(tag_name: 'pre').text).to eq('Login please')
      end

      it 'cancels a challenge whose handler raises, and raises it on the next command' do
        driver = local_driver(web_socket_url: true)
        driver.network.add_authentication_handler { raise ArgumentError, 'handler failed' }

        driver.navigate.to url_for('basicAuth')

        expect { driver.find_element(tag_name: 'pre') }.to raise_error(ArgumentError, 'handler failed')
        expect(driver.find_element(tag_name: 'pre').text).to eq('Login please')
      end

      it 'answers a challenge only in the window a handler is scoped to' do
        driver = local_driver(web_socket_url: true)
        scoped = driver.window_handle
        driver.network.add_authentication_handler(&:cancel)
        driver.network.add_authentication(username: username, password: password, window_handle: scoped)

        driver.switch_to.new_window(:tab)
        driver.navigate.to url_for('basicAuth')
        expect(driver.find_element(tag_name: 'pre').text).to eq('Login please')

        driver.switch_to.window(scoped)
        driver.navigate.to url_for('basicAuth')
        expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
      end

      it 'answers a challenge only in the user context a handler is scoped to' do
        driver = local_driver(web_socket_url: true)
        user_context = BiDi::Protocol::Browser.new(driver).create_user_context.user_context
        tab = BiDi::Protocol::BrowsingContext.new(driver).create(type: :tab, user_context: user_context).context
        driver.network.add_authentication_handler(&:cancel)
        driver.network.add_authentication(username: username, password: password, user_context: user_context)

        driver.navigate.to url_for('basicAuth')
        expect(driver.find_element(tag_name: 'pre').text).to eq('Login please')

        driver.switch_to.window(tab)
        driver.navigate.to url_for('basicAuth')
        expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
      end

      it 'adds a request handler' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        network.add_request_handler(&:continue)
        driver.navigate.to url_for('formPage.html')
        expect(driver.current_url).to eq(url_for('formPage.html'))
        expect(network.callbacks.count).to be 1
      end

      it 'adds a request handler with a filter' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        network.add_request_handler(url_for('formPage.html'), &:continue)
        driver.navigate.to url_for('formPage.html')
        expect(driver.current_url).to eq(url_for('formPage.html'))
        expect(network.callbacks.count).to be 1
      end

      it 'adds a request handler with multiple filters' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        network.add_request_handler(url_for('formPage.html'), url_for('basicAuth'), &:continue)
        driver.navigate.to url_for('formPage.html')
        expect(driver.current_url).to eq(url_for('formPage.html'))
        expect(network.callbacks.count).to be 1
      end

      it 'adds a request handler with a pattern type' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        network.add_request_handler(url_for('formPage.html'), pattern_type: :url, &:continue)
        driver.navigate.to url_for('formPage.html')
        expect(driver.current_url).to eq(url_for('formPage.html'))
        expect(network.callbacks.count).to be 1
      end

      it 'adds a request handler with attributes' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        network.add_request_handler do |request|
          request.method = 'GET'
          request.url = url_for('formPage.html')
          request.headers['foo'] = 'bar'
          request.headers['baz'] = 'qux'
          request.cookies({
                            name: 'test',
                            value: 'value4',
                            domain: 'example.com',
                            path: '/path',
                            size: 1234,
                            httpOnly: true,
                            secure: true,
                            sameSite: 'Strict',
                            expiry: 1234
                          })
          request.body = ({test: 'example'})
          request.continue
        end
        driver.navigate.to url_for('formPage.html')
        expect(driver.current_url).to eq(url_for('formPage.html'))
        expect(network.callbacks.count).to be 1
      end

      it 'fails a request' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        network.add_request_handler(&:fail)
        expect(network.callbacks.count).to be 1
        expect { driver.navigate.to url_for('formPage.html') }.to raise_error(Error::WebDriverError)
      end

      it 'removes a request handler' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        id = network.add_request_handler(&:continue)
        network.remove_handler(id)
        expect(network.callbacks.count).to be 0
      end

      it 'clears all request handlers' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        2.times { network.add_request_handler(&:continue) }
        network.clear_handlers
        expect(network.callbacks.count).to be 0
      end

      it 'adds a response handler' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        network.add_response_handler(&:continue)
        driver.navigate.to url_for('formPage.html')
        expect(driver.current_url).to eq(url_for('formPage.html'))
        expect(network.callbacks.count).to be 1
      end

      it 'adds a response handler with a filter' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        network.add_response_handler(url_for('formPage.html'), &:continue)
        driver.navigate.to url_for('formPage.html')
        expect(driver.find_element(name: 'login')).to be_displayed
        expect(network.callbacks.count).to be 1
      end

      it 'adds a response handler with multiple filters' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        network.add_response_handler(url_for('formPage.html'), url_for('basicAuth'), &:continue)
        driver.navigate.to url_for('formPage.html')
        expect(driver.find_element(name: 'login')).to be_displayed
        expect(network.callbacks.count).to be 1
      end

      it 'adds a response handler with a pattern type' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        network.add_response_handler(url_for('formPage.html'), pattern_type: :url, &:continue)
        driver.navigate.to url_for('formPage.html')
        expect(driver.current_url).to eq(url_for('formPage.html'))
        expect(network.callbacks.count).to be 1
      end

      it 'adds a response handler with attributes' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        network.add_response_handler do |response|
          response.reason = 'OK'
          response.headers['foo'] = 'bar'
          response.credentials.username = 'foo'
          response.credentials.password = 'bar'
          response.cookies({
                             name: 'foo',
                             domain: 'localhost',
                             httpOnly: true,
                             expiry: '1_000_000',
                             maxAge: 1_000,
                             path: '/',
                             sameSite: 'none',
                             secure: false
                           })
          response.continue
        end
        driver.navigate.to url_for('formPage.html')
        expect(driver.current_url).to eq(url_for('formPage.html'))
        expect(network.callbacks.count).to be 1
      end

      it 'adds a response handler that provides a response',
         pending_if: {browser: :firefox,
                      reason: 'https://github.com/w3c/webdriver-bidi/issues/747'} do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        network.add_response_handler do |response|
          response.status = 200
          response.headers['foo'] = 'bar'
          response.body = '<html><head><title>Hello World!</title></head><body/></html>'
          response.provide_response
        end
        driver.navigate.to url_for('formPage.html')
        source = driver.page_source
        expect(source).not_to include('There should be a form here:')
        expect(source).to include('Hello World!')
      end

      it 'removes a response handler' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        id = network.add_response_handler(&:continue)
        network.remove_handler(id)
        network.clear_handlers
        expect(network.callbacks.count).to be 0
      end

      it 'clears all response handlers' do
        driver = local_driver(web_socket_url: true)
        network = driver.network
        2.times { network.add_response_handler(&:continue) }
        network.clear_handlers
        expect(network.callbacks.count).to be 0
      end
    end
  end
end
