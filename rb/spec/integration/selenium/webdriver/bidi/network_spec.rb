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
      describe Network, exclusive: {bidi: true, reason: 'only executed when bidi is enabled'},
                        only: {browser: %i[chrome edge firefox]} do
        after { |example| reset_driver!(example: example) }

        it 'adds an intercept' do
          network = described_class.new(driver.bidi)
          intercept = network.add_intercept(phases: [described_class::PHASES[:before_request]])
          expect(intercept).not_to be_nil
        end

        it 'adds an intercept with a default pattern type' do
          network = described_class.new(driver.bidi)
          pattern = 'http://localhost:4444/formPage.html'
          intercept = network.add_intercept(phases: [described_class::PHASES[:before_request]], url_patterns: pattern)
          expect(intercept).not_to be_nil
        end

        it 'adds an intercept with a url pattern' do
          network = described_class.new(driver.bidi)
          pattern = 'http://localhost:4444/formPage.html'
          intercept = network.add_intercept(phases: [described_class::PHASES[:before_request]],
                                            url_patterns: pattern,
                                            pattern_type: :url)
          expect(intercept).not_to be_nil
        end

        it 'removes an intercept' do
          network = described_class.new(driver.bidi)
          intercept = network.add_intercept(phases: [described_class::PHASES[:before_request]])
          expect(network.remove_intercept(intercept['intercept'])).to be_empty
        end

        it 'continues with auth' do
          username = SpecSupport::RackServer::TestApp::BASIC_AUTH_CREDENTIALS.first
          password = SpecSupport::RackServer::TestApp::BASIC_AUTH_CREDENTIALS.last
          network = described_class.new(driver.bidi)
          phases = [Selenium::WebDriver::BiDi::Network::PHASES[:auth_required]]
          network.add_intercept(phases: phases)
          network.on(:auth_required) do |event|
            request_id = event['request']['request']
            network.continue_with_auth(request_id, username, password)
          end

          driver.navigate.to url_for('basicAuth')
          expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
        end

        it 'continues without auth' do
          network = described_class.new(driver.bidi)
          network.add_intercept(phases: [described_class::PHASES[:auth_required]])
          network.on(:auth_required) do |event|
            request_id = event['request']['request']
            network.continue_without_auth(request_id)
          end

          expect { driver.navigate.to url_for('basicAuth') }.to raise_error(Error::WebDriverError)
        end

        it 'cancels auth' do
          network = described_class.new(driver.bidi)
          network.add_intercept(phases: [described_class::PHASES[:auth_required]])
          network.on(:auth_required) do |event|
            request_id = event['request']['request']
            network.cancel_auth(request_id)
          end

          driver.navigate.to url_for('basicAuth')
          expect(driver.find_element(tag_name: 'pre').text).to eq('Login please')
        end

        it 'continues request' do
          network = described_class.new(driver.bidi)
          network.add_intercept(phases: [described_class::PHASES[:before_request]])
          network.on(:before_request) do |event|
            request_id = event['request']['request']
            network.continue_request(id: request_id)
          end

          driver.navigate.to url_for('formPage.html')
          expect(driver.find_element(name: 'login')).to be_displayed
        end

        it 'fails request' do
          network = described_class.new(driver.bidi)
          network.add_intercept(phases: [described_class::PHASES[:before_request]])
          network.on(:before_request) do |event|
            request_id = event['request']['request']
            network.fail_request(request_id)
          end

          expect { driver.navigate.to url_for('formPage.html') }.to raise_error(Error::WebDriverError)
        end

        it 'continues response' do
          network = described_class.new(driver.bidi)
          network.add_intercept(phases: [described_class::PHASES[:response_started]])
          network.on(:response_started) do |event|
            request_id = event['request']['request']
            network.continue_response(id: request_id)
          end

          driver.navigate.to url_for('formPage.html')
          expect(driver.find_element(name: 'login')).to be_displayed
        end

        it 'provides response', except: {browser: :firefox,
                                         reason: 'https://github.com/w3c/webdriver-bidi/issues/747'} do
          network = described_class.new(driver.bidi)
          network.add_intercept(phases: [described_class::PHASES[:response_started]])
          network.on(:response_started) do |event|
            request_id = event['request']['request']
            network.provide_response(
              id: request_id,
              status: 200,
              headers: [
                {
                  name: 'foo',
                  value: {
                    type: 'string',
                    value: 'bar'
                  }
                }
              ],
              body: {
                type: 'string',
                value: '<html><head><title>Hello World!</title></head><body/></html>'
              }
            )
          end

          driver.navigate.to url_for('formPage.html')
          source = driver.page_source
          expect(source).not_to include('There should be a form here:')
          expect(source).to include('Hello World!')
        end

        it 'sets the cache to bypass' do
          browsing_context = BrowsingContext.new(driver).create
          network = described_class.new(driver.bidi)
          network.set_cache_behavior('bypass', browsing_context)
          expect(network.set_cache_behavior('bypass', browsing_context)).to be_a(Hash)
        end

        it 'sets the cache to default' do
          browsing_context = BrowsingContext.new(driver).create
          network = described_class.new(driver.bidi)
          expect(network.set_cache_behavior('default', browsing_context)).to be_a(Hash)
        end
      end
    end
  end
end
