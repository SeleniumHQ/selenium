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
    describe Network, exclude: {version: 'beta'},
                      exclusive: {bidi: true, reason: 'only executed when bidi is enabled'},
                      only: {browser: %i[chrome edge firefox]} do
      let(:username) { SpecSupport::RackServer::TestApp::BASIC_AUTH_CREDENTIALS.first }
      let(:password) { SpecSupport::RackServer::TestApp::BASIC_AUTH_CREDENTIALS.last }

      it 'adds an auth handler' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_authentication_handler(username, password)
          driver.navigate.to url_for('basicAuth')
          expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
          expect(network.callbacks.count).to be 1
        end
      end

      it 'adds an auth handler with a filter' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_authentication_handler(username, password, url_for('basicAuth'))
          driver.navigate.to url_for('basicAuth')
          expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
          expect(network.callbacks.count).to be 1
        end
      end

      it 'adds an auth handler with multiple filters' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_authentication_handler(username, password, url_for('basicAuth'), url_for('formPage.html'))
          driver.navigate.to url_for('basicAuth')
          expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
          expect(network.callbacks.count).to be 1
        end
      end

      it 'adds an auth handler with a pattern type' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_authentication_handler(username, password, url_for('basicAuth'), pattern_type: :url)
          driver.navigate.to url_for('basicAuth')
          expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
          expect(network.callbacks.count).to be 1
        end
      end

      it 'removes an auth handler' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          id = network.add_authentication_handler(username, password)
          network.remove_handler(id)
          expect(network.callbacks.count).to be 0
        end
      end

      it 'clears all auth handlers' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          2.times { network.add_authentication_handler(username, password) }
          network.clear_handlers
          expect(network.callbacks.count).to be 0
        end
      end

      it 'continues without auth' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_authentication_handler(&:skip)
          expect { driver.navigate.to url_for('basicAuth') }.to raise_error(Error::WebDriverError)
        end
      end

      it 'cancels auth' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_authentication_handler(&:cancel)
          driver.navigate.to url_for('basicAuth')
          expect(driver.find_element(tag_name: 'pre').text).to eq('Login please')
        end
      end

      it 'adds a request handler' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_request_handler(&:continue)
          driver.navigate.to url_for('formPage.html')
          expect(driver.current_url).to eq(url_for('formPage.html'))
          expect(network.callbacks.count).to be 1
        end
      end

      it 'adds a request handler with a filter' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_request_handler(url_for('formPage.html'), &:continue)
          driver.navigate.to url_for('formPage.html')
          expect(driver.current_url).to eq(url_for('formPage.html'))
          expect(network.callbacks.count).to be 1
        end
      end

      it 'adds a request handler with multiple filters' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_request_handler(url_for('formPage.html'), url_for('basicAuth'), &:continue)
          driver.navigate.to url_for('formPage.html')
          expect(driver.current_url).to eq(url_for('formPage.html'))
          expect(network.callbacks.count).to be 1
        end
      end

      it 'adds a request handler with a pattern type' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_request_handler(url_for('formPage.html'), pattern_type: :url, &:continue)
          driver.navigate.to url_for('formPage.html')
          expect(driver.current_url).to eq(url_for('formPage.html'))
          expect(network.callbacks.count).to be 1
        end
      end

      it 'adds a request handler with attributes' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
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
      end

      it 'fails a request' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_request_handler(&:fail)
          expect(network.callbacks.count).to be 1
          expect { driver.navigate.to url_for('formPage.html') }.to raise_error(Error::WebDriverError)
        end
      end

      it 'removes a request handler' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          id = network.add_request_handler(&:continue)
          network.remove_handler(id)
          expect(network.callbacks.count).to be 0
        end
      end

      it 'clears all request handlers' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          2.times { network.add_request_handler(&:continue) }
          network.clear_handlers
          expect(network.callbacks.count).to be 0
        end
      end

      it 'adds a response handler' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_response_handler(&:continue)
          driver.navigate.to url_for('formPage.html')
          expect(driver.current_url).to eq(url_for('formPage.html'))
          expect(network.callbacks.count).to be 1
        end
      end

      it 'adds a response handler with a filter' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_response_handler(url_for('formPage.html'), &:continue)
          driver.navigate.to url_for('formPage.html')
          expect(driver.find_element(name: 'login')).to be_displayed
          expect(network.callbacks.count).to be 1
        end
      end

      it 'adds a response handler with multiple filters' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_response_handler(url_for('formPage.html'), url_for('basicAuth'), &:continue)
          driver.navigate.to url_for('formPage.html')
          expect(driver.find_element(name: 'login')).to be_displayed
          expect(network.callbacks.count).to be 1
        end
      end

      it 'adds a response handler with a pattern type' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_response_handler(url_for('formPage.html'), pattern_type: :url, &:continue)
          driver.navigate.to url_for('formPage.html')
          expect(driver.current_url).to eq(url_for('formPage.html'))
          expect(network.callbacks.count).to be 1
        end
      end

      it 'adds a response handler with attributes' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
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
      end

      it 'adds a response handler that provides a response',
         except: {browser: :firefox,
                  reason: 'https://github.com/w3c/webdriver-bidi/issues/747'} do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
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
      end

      it 'removes a response handler' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          id = network.add_response_handler(&:continue)
          network.remove_handler(id)
          network.clear_handlers
          expect(network.callbacks.count).to be 0
        end
      end

      it 'clears all response handlers' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          2.times { network.add_response_handler(&:continue) }
          network.clear_handlers
          expect(network.callbacks.count).to be 0
        end
      end
    end
  end
end
