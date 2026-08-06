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

module Selenium
  module WebDriver
    class BiDi
      module Protocol
        describe Network, skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          after { |example| reset_driver!(example: example) }

          let(:network) { described_class.new(driver) }
          let(:browsing_context) { BrowsingContext.new(driver) }
          let(:session) { Session.new(driver) }

          def bytes(value)
            Network::StringValue.new(value: value)
          end

          def header(name, value)
            Network::Header.new(name: name, value: bytes(value))
          end

          def subscribe(event)
            events = []
            callback = driver.bidi.add_callback(event) { |params| events << params }
            session.subscribe(events: [event])
            [events, callback]
          end

          def unsubscribe(event, callback)
            session.unsubscribe(events: [event])
          ensure
            driver.bidi.remove_callback(event, callback) if callback
          end

          def blocked_event(events, intercept)
            wait.until do
              events.find { |event| event['isBlocked'] && Array(event['intercepts']).include?(intercept.intercept) }
            end
          end

          describe '#add_data_collector',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari returns unknown command for network.add_data_collector'} do
            it 'returns a collector id' do
              result = network.add_data_collector(data_types: [:response], max_encoded_data_size: 200_000_000)

              expect(result).to be_a(Network::AddDataCollectorResult)
              expect(result.collector).to be_a(String)
            ensure
              network.remove_data_collector(collector: result.collector) if result&.collector
            end

            it 'accepts collector type and context filters' do
              result = network.add_data_collector(
                data_types: [:request],
                max_encoded_data_size: 200_000_000,
                collector_type: :blob,
                contexts: [driver.window_handle]
              )

              expect(result.collector).to be_a(String)
            ensure
              network.remove_data_collector(collector: result.collector) if result&.collector
            end
          end

          describe '#add_intercept',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari returns unknown command for network.add_intercept'} do
            it 'returns an intercept id' do
              result = network.add_intercept(phases: [:before_request_sent])

              expect(result).to be_a(Network::AddInterceptResult)
              expect(result.intercept).to be_a(String)
            ensure
              network.remove_intercept(intercept: result.intercept) if result&.intercept
            end

            it 'accepts context and URL pattern filters' do
              result = network.add_intercept(
                phases: [:before_request_sent],
                contexts: [driver.window_handle],
                url_patterns: [Network::UrlPatternString.new(pattern: url_for('formPage.html'))]
              )

              expect(result.intercept).to be_a(String)
            ensure
              network.remove_intercept(intercept: result.intercept) if result&.intercept
            end
          end

          describe '#continue_request',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari returns unknown command for network.continue_request'} do
            it 'continues an intercepted request' do
              intercept = network.add_intercept(phases: [:before_request_sent])
              events, callback = subscribe('network.beforeRequestSent')

              driver.bidi.add_callback('network.beforeRequestSent') do |event|
                next unless event['isBlocked'] && Array(event['intercepts']).include?(intercept.intercept)

                network.continue_request(request: event['request']['request'])
              rescue Error::WebDriverError
                nil
              end

              browsing_context.navigate(context: driver.window_handle, url: url_for('formPage.html'), wait: :complete)

              expect(events.count { |event| event['isBlocked'] }).to be_positive
              expect(driver.find_element(name: 'login')).to be_displayed
            ensure
              unsubscribe('network.beforeRequestSent', callback) if callback
              network.remove_intercept(intercept: intercept.intercept) if intercept&.intercept
            end

            it 'accepts optional headers, method, and URL parameters' do
              intercept = network.add_intercept(
                phases: [:before_request_sent],
                url_patterns: [Network::UrlPatternString.new(pattern: url_for('bidi/emptyText.txt'))]
              )
              events, callback = subscribe('network.beforeRequestSent')

              driver.bidi.add_callback('network.beforeRequestSent') do |event|
                next unless event['isBlocked'] && Array(event['intercepts']).include?(intercept.intercept)

                network.continue_request(
                  request: event['request']['request'],
                  headers: [header('x-ruby-bidi', 'continued')],
                  method_: 'GET',
                  url: event['request']['url']
                )
              rescue Error::WebDriverError
                nil
              end

              browsing_context.navigate(
                context: driver.window_handle,
                url: url_for('bidi/emptyText.txt'),
                wait: :complete
              )

              expect(blocked_event(events, intercept)['request']['url']).to eq(url_for('bidi/emptyText.txt'))
            ensure
              unsubscribe('network.beforeRequestSent', callback) if callback
              network.remove_intercept(intercept: intercept.intercept) if intercept&.intercept
            end
          end

          describe '#continue_response',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari returns unknown command for network.continue_response'} do
            it 'continues an intercepted response' do
              intercept = network.add_intercept(phases: [:response_started])
              events, callback = subscribe('network.responseStarted')

              driver.bidi.add_callback('network.responseStarted') do |event|
                next unless event['isBlocked'] && Array(event['intercepts']).include?(intercept.intercept)

                network.continue_response(request: event['request']['request'])
              rescue Error::WebDriverError
                nil
              end

              browsing_context.navigate(context: driver.window_handle, url: url_for('formPage.html'), wait: :complete)

              expect(blocked_event(events, intercept)['response']['status']).to eq(200)
              expect(driver.find_element(name: 'login')).to be_displayed
            ensure
              unsubscribe('network.responseStarted', callback) if callback
              network.remove_intercept(intercept: intercept.intercept) if intercept&.intercept
            end

            it 'accepts optional response headers and status parameters' do
              intercept = network.add_intercept(phases: [:response_started])
              events, callback = subscribe('network.responseStarted')

              driver.bidi.add_callback('network.responseStarted') do |event|
                next unless event['isBlocked'] && Array(event['intercepts']).include?(intercept.intercept)

                network.continue_response(
                  request: event['request']['request'],
                  headers: [header('x-ruby-bidi-response', 'continued')],
                  reason_phrase: 'OK',
                  status_code: 200
                )
              rescue Error::WebDriverError
                nil
              end

              browsing_context.navigate(context: driver.window_handle, url: url_for('formPage.html'), wait: :complete)

              expect(blocked_event(events, intercept)['response']['status']).to eq(200)
            ensure
              unsubscribe('network.responseStarted', callback) if callback
              network.remove_intercept(intercept: intercept.intercept) if intercept&.intercept
            end
          end

          describe '#continue_with_auth',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari returns unknown command for network.continue_with_auth'} do
            it 'provides credentials for an auth challenge' do
              username, password = SpecSupport::RackServer::TestApp::BASIC_AUTH_CREDENTIALS
              intercept = network.add_intercept(phases: [:auth_required])
              _events, callback = subscribe('network.authRequired')

              driver.bidi.add_callback('network.authRequired') do |event|
                next unless event['isBlocked'] && Array(event['intercepts']).include?(intercept.intercept)

                network.continue_with_auth(
                  request: event['request']['request'],
                  action: :provide_credentials,
                  credentials: Network::AuthCredentials.new(username: username, password: password)
                )
              rescue Error::WebDriverError
                nil
              end

              browsing_context.navigate(context: driver.window_handle, url: url_for('basicAuth'), wait: :complete)

              expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
            ensure
              unsubscribe('network.authRequired', callback) if callback
              network.remove_intercept(intercept: intercept.intercept) if intercept&.intercept
            end
          end

          describe '#fail_request',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari returns unknown command for network.fail_request'} do
            it 'fails an intercepted request' do
              intercept = network.add_intercept(
                phases: [:before_request_sent],
                url_patterns: [Network::UrlPatternString.new(pattern: url_for('formPage.html'))]
              )
              _events, callback = subscribe('network.beforeRequestSent')

              driver.bidi.add_callback('network.beforeRequestSent') do |event|
                next unless event['isBlocked'] && Array(event['intercepts']).include?(intercept.intercept)

                network.fail_request(request: event['request']['request'])
              rescue Error::WebDriverError
                nil
              end

              expect {
                browsing_context.navigate(context: driver.window_handle, url: url_for('formPage.html'), wait: :complete)
              }.to raise_error(Error::WebDriverError)
            ensure
              unsubscribe('network.beforeRequestSent', callback) if callback
              network.remove_intercept(intercept: intercept.intercept) if intercept&.intercept
            end
          end

          describe '#get_data',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari returns unknown command for network.get_data'} do
            it 'gets and disowns collected response data' do
              collector = network.add_data_collector(data_types: [:response], max_encoded_data_size: 200_000_000)
              events, callback = subscribe('network.responseCompleted')

              browsing_context.navigate(
                context: driver.window_handle,
                url: url_for('bidi/emptyText.txt'),
                wait: :complete
              )
              event = wait.until { events.find { |item| item.dig('request', 'url') == url_for('bidi/emptyText.txt') } }

              result = network.get_data(
                data_type: :response,
                collector: collector.collector,
                request: event['request']['request']
              )

              expect(result.bytes).to be_a(Network::StringValue).or be_a(Network::Base64Value)
              expect(network.disown_data(
                       data_type: :response,
                       collector: collector.collector,
                       request: event['request']['request']
                     )).to be_empty
            ensure
              unsubscribe('network.responseCompleted', callback) if callback
              network.remove_data_collector(collector: collector.collector) if collector&.collector
            end
          end

          describe '#provide_response',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari returns unknown command for network.provide_response'} do
            it 'provides a complete response body' do
              intercept = network.add_intercept(
                phases: [:before_request_sent],
                url_patterns: [Network::UrlPatternString.new(pattern: url_for('formPage.html'))]
              )
              _events, callback = subscribe('network.beforeRequestSent')

              driver.bidi.add_callback('network.beforeRequestSent') do |event|
                next unless event['isBlocked'] && Array(event['intercepts']).include?(intercept.intercept)

                network.provide_response(
                  request: event['request']['request'],
                  status_code: 200,
                  reason_phrase: 'OK',
                  headers: [header('content-type', 'text/html')],
                  body: bytes('<html><head><title>Provided by Ruby BiDi</title></head><body>ok</body></html>')
                )
              rescue Error::WebDriverError
                nil
              end

              browsing_context.navigate(context: driver.window_handle, url: url_for('formPage.html'), wait: :complete)

              expect(driver.title).to eq('Provided by Ruby BiDi')
            ensure
              unsubscribe('network.beforeRequestSent', callback) if callback
              network.remove_intercept(intercept: intercept.intercept) if intercept&.intercept
            end
          end

          describe '#remove_data_collector',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari returns unknown command for network.remove_data_collector'} do
            it 'removes a collector' do
              collector = network.add_data_collector(data_types: [:response], max_encoded_data_size: 200_000_000)

              expect(network.remove_data_collector(collector: collector.collector)).to be_empty
            end
          end

          describe '#remove_intercept',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari returns unknown command for network.remove_intercept'} do
            it 'removes an intercept' do
              intercept = network.add_intercept(phases: [:before_request_sent])

              expect(network.remove_intercept(intercept: intercept.intercept)).to be_empty
            end
          end

          describe '#set_cache_behavior' do
            it 'sets and clears context cache behavior' do
              expect(network.set_cache_behavior(cache_behavior: :bypass, contexts: [driver.window_handle])).to be_empty
              expect(network.set_cache_behavior(cache_behavior: :default, contexts: [driver.window_handle])).to be_empty
            end
          end

          describe '#set_extra_headers',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::SerializationError},
                                reason: 'Safari network.setExtraHeaders result fails strict deserialization'} do
            it 'adds extra request headers for a context' do
              events, callback = subscribe('network.beforeRequestSent')

              network.set_extra_headers(headers: [header('x-ruby-bidi-extra', 'present')],
                                        contexts: [driver.window_handle])
              browsing_context.navigate(
                context: driver.window_handle,
                url: url_for('bidi/emptyText.txt'),
                wait: :complete
              )

              event = wait.until do
                events.find do |item|
                  Array(item.dig('request', 'headers')).any? do |item_header|
                    item_header['name'].casecmp?('x-ruby-bidi-extra')
                  end
                end
              end
              actual = event['request']['headers'].find do |item_header|
                item_header['name'].casecmp?('x-ruby-bidi-extra')
              end

              expect(actual['value']['value']).to eq('present')
            ensure
              begin
                network.set_extra_headers(headers: [], contexts: [driver.window_handle])
              rescue StandardError
                nil
              end
              unsubscribe('network.beforeRequestSent', callback) if callback
            end

            it 'accepts user-context filters' do
              user_context = Browser.new(driver).create_user_context.user_context

              expect(network.set_extra_headers(
                       headers: [header('x-ruby-bidi-user-context', 'present')],
                       user_contexts: [user_context]
                     )).to be_empty
            ensure
              network.set_extra_headers(headers: [], user_contexts: [user_context]) if user_context
              Browser.new(driver).remove_user_context(user_context: user_context) if user_context
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
