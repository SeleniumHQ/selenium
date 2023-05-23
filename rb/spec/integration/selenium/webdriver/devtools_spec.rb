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
    describe DevTools, exclusive: {browser: %i[chrome edge firefox]} do
      after { reset_driver! }

      it 'sends commands' do
        driver.devtools.page.navigate(url: url_for('xhtmlTest.html'))
        expect(driver.title).to eq('XHTML Test Page')
      end

      it 'maps methods to classes' do
        expect(driver.devtools.css).not_to be_nil
        expect(driver.devtools.dom).not_to be_nil
        expect(driver.devtools.dom_debugger).not_to be_nil
      end

      it 'supports events', except: {browser: :firefox,
                                     reason: 'https://bugzilla.mozilla.org/show_bug.cgi?id=1819965'} do
        expect { |block|
          driver.devtools.page.enable
          driver.devtools.page.on(:load_event_fired, &block)
          driver.navigate.to url_for('xhtmlTest.html')
          sleep 0.5
        }.to yield_control
      end

      it 'propagates errors in events', except: {browser: :firefox,
                                                 reason: 'https://bugzilla.mozilla.org/show_bug.cgi?id=1819965'} do
        expect {
          driver.devtools.page.enable
          driver.devtools.page.on(:load_event_fired) { raise 'This is fine!' }
          driver.navigate.to url_for('xhtmlTest.html')
          sleep 0.5
        }.to raise_error(RuntimeError, 'This is fine!')
      end

      describe '#register', except: {browser: :firefox,
                                     reason: 'Fetch.enable is not yet supported'} do
        let(:username) { SpecSupport::RackServer::TestApp::BASIC_AUTH_CREDENTIALS.first }
        let(:password) { SpecSupport::RackServer::TestApp::BASIC_AUTH_CREDENTIALS.last }

        it 'on any request' do
          driver.register(username: username, password: password)

          driver.navigate.to url_for('basicAuth')
          expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
        end

        it 'based on URL' do
          auth_url = url_for('basicAuth')
          driver.register(username: username, password: password, uri: /localhost/)

          driver.navigate.to auth_url.sub('localhost', '127.0.0.1')
          expect { driver.find_element(tag_name: 'h1') }.to raise_error(Error::NoSuchElementError)

          driver.navigate.to auth_url
          expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
        end
      end

      it 'notifies about log messages', except: {browser: :firefox,
                                                 reason: 'https://bugzilla.mozilla.org/show_bug.cgi?id=1819965'} do
        logs = []
        driver.on_log_event(:console) { |log| logs.push(log) }
        driver.navigate.to url_for('javascriptPage.html')

        driver.execute_script("console.log('I like cheese');")
        sleep 0.5
        driver.execute_script('console.log(true);')
        sleep 0.5
        driver.execute_script('console.log(null);')
        sleep 0.5
        driver.execute_script('console.log(undefined);')
        sleep 0.5
        driver.execute_script('console.log(document);')
        sleep 0.5

        expect(logs).to include(
          an_object_having_attributes(type: :log, args: ['I like cheese']),
          an_object_having_attributes(type: :log, args: [true]),
          an_object_having_attributes(type: :log, args: [nil]),
          an_object_having_attributes(type: :log, args: [{'type' => 'undefined'}])
        )
      end

      it 'notifies about document log messages', except: {browser: :firefox,
                                                          reason: 'Firefox & Chrome parse document differently'} do
        logs = []
        driver.on_log_event(:console) { |log| logs.push(log) }
        driver.navigate.to url_for('javascriptPage.html')

        driver.execute_script('console.log(document);')
        wait.until { !logs.empty? }

        expect(logs).to include(
          an_object_having_attributes(type: :log, args: [hash_including('type' => 'object')])
        )
      end

      it 'notifies about document log messages',
         except: {browser: %i[chrome edge firefox], reason: 'https://bugzilla.mozilla.org/show_bug.cgi?id=1819965'} do
        logs = []
        driver.on_log_event(:console) { |log| logs.push(log) }
        driver.navigate.to url_for('javascriptPage.html')

        driver.execute_script('console.log(document);')
        wait.until { !logs.empty? }

        expect(logs).to include(
          an_object_having_attributes(type: :log, args: [hash_including('location')])
        )
      end

      it 'notifies about exceptions', except: {browser: :firefox,
                                               reason: 'https://bugzilla.mozilla.org/show_bug.cgi?id=1819965'} do
        exceptions = []
        driver.on_log_event(:exception) { |exception| exceptions.push(exception) }
        driver.navigate.to url_for('javascriptPage.html')

        driver.find_element(id: 'throwing-mouseover').click
        wait.until { exceptions.any? }

        exception = exceptions.first
        expect(exception.description).to include('Error: I like cheese')
        expect(exception.stacktrace).not_to be_empty
      end

      it 'notifies about DOM mutations', except: {browser: :firefox,
                                                  reason: 'Runtime.addBinding not yet supported'} do
        mutations = []
        driver.on_log_event(:mutation) { |mutation| mutations.push(mutation) }
        driver.navigate.to url_for('dynamic.html')

        driver.find_element(id: 'reveal').click
        wait.until { mutations.any? }

        mutation = mutations.first
        expect(mutation.element).to eq(driver.find_element(id: 'revealed'))
        expect(mutation.attribute_name).to eq('style')
        expect(mutation.current_value).to eq('')
        expect(mutation.old_value).to eq('display:none;')
      end

      describe '#intercept', except: {browser: :firefox,
                                      reason: 'Fetch.enable is not yet supported'} do
        it 'continues requests' do
          requests = []
          driver.intercept do |request, &continue|
            requests << request
            continue.call(request)
          end
          driver.navigate.to url_for('html5Page.html')
          expect(driver.title).to eq('HTML5')
          expect(requests).not_to be_empty
        end

        it 'changes requests' do
          driver.intercept do |request, &continue|
            uri = URI(request.url)
            if uri.path.end_with?('one.js')
              uri.path = '/devtools_request_interception_test/two.js'
              request.url = uri.to_s
            end
            request.post_data = {foo: 'bar'}.to_json
            continue.call(request)
          end
          driver.navigate.to url_for('devToolsRequestInterceptionTest.html')
          driver.find_element(tag_name: 'button').click
          expect(driver.find_element(id: 'result').text).to eq('two')
        end

        it 'continues responses' do
          responses = []
          driver.intercept do |request, &continue|
            continue.call(request) do |response|
              responses << response
            end
          end
          driver.navigate.to url_for('html5Page.html')
          expect(driver.title).to eq('HTML5')
          expect(responses).not_to be_empty
        end

        it 'changes responses' do
          driver.intercept do |request, &continue|
            continue.call(request) do |response|
              response.body << '<h4 id="appended">Appended!</h4>' if request.url.include?('html5Page.html')
            end
          end
          driver.navigate.to url_for('html5Page.html')
          expect(driver.find_elements(id: 'appended')).not_to be_empty
        end
      end

      describe '#pin_script', except: {browser: :firefox} do
        before do
          driver.navigate.to url_for('xhtmlTest.html')
        end

        it 'allows to pin script' do
          script = driver.pin_script('return document.title;')
          expect(driver.pinned_scripts).to eq([script])
          expect(driver.execute_script(script)).to eq('XHTML Test Page')
        end

        it 'ensures pinned script is available on new pages' do
          script = driver.pin_script('return document.title;')
          driver.navigate.to url_for('formPage.html')
          expect(driver.execute_script(script)).to eq('We Leave From Here')
        end

        it 'allows to unpin script' do
          script = driver.pin_script('return document.title;')
          driver.unpin_script(script)
          expect(driver.pinned_scripts).to be_empty
          expect { driver.execute_script(script) }.to raise_error(Error::JavascriptError)
        end

        it 'ensures unpinned scripts are not available on new pages' do
          script = driver.pin_script('return document.title;')
          driver.unpin_script(script)
          driver.navigate.to url_for('formPage.html')
          expect { driver.execute_script(script) }.to raise_error(Error::JavascriptError)
        end

        it 'handles arguments in pinned script' do
          script = driver.pin_script('return arguments;')
          element = driver.find_element(id: 'id1')
          expect(driver.execute_script(script, 1, true, element)).to eq([1, true, element])
        end

        it 'supports async pinned scripts' do
          script = driver.pin_script('arguments[0]()')
          expect { driver.execute_async_script(script) }.not_to raise_error
        end
      end
    end
  end
end
