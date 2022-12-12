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

module Selenium
  module WebDriver
    class BiDi
      describe BrowsingContext, exclusive: {browser: %i[chrome firefox]} do
        it 'can create a browsing context for given id' do
          reset_driver!(web_socket_url: true) do |driver|
            id = driver.window_handle
            browsing_context = BrowsingContext.new(driver: driver, browsing_context_id: id)
            expect(browsing_context.id).eql? id
          end
        end

        it 'can create a window' do
          reset_driver!(web_socket_url: true) do |driver|
            browsing_context = BrowsingContext.new(driver: driver, type: :window)
            expect(browsing_context.id).not_to be_nil
          end
        end

        it 'can create a window with a reference context' do
          reset_driver!(web_socket_url: true) do |driver|
            browsing_context = BrowsingContext.new(driver: driver, type: :window,
                                                   reference_context: driver.window_handle)
            expect(browsing_context.id).not_to be_nil
          end
        end

        it 'can create a tab' do
          reset_driver!(web_socket_url: true) do |driver|
            browsing_context = BrowsingContext.new(driver: driver, type: :tab)
            expect(browsing_context.id).not_to be_nil
          end
        end

        it 'can create a tab with a reference context' do
          reset_driver!(web_socket_url: true) do |driver|
            browsing_context = BrowsingContext.new(driver: driver, type: :tab, reference_context: driver.window_handle)
            expect(browsing_context.id).not_to be_nil
          end
        end

        it 'can navigate to a url' do
          reset_driver!(web_socket_url: true) do |driver|
            browsing_context = BrowsingContext.new(driver: driver, type: :tab)

            info = browsing_context.navigate url: url_for('/bidi/logEntryAdded.html')

            expect(browsing_context.id).not_to be_nil
            expect(info.navigation_id).nil?
            expect(info.url).to include('/bidi/logEntryAdded.html')
          end
        end

        it 'can navigate to a url with readiness state' do
          reset_driver!(web_socket_url: true) do |driver|
            browsing_context = BrowsingContext.new(driver: driver, type: :tab)

            info = browsing_context.navigate url: url_for('/bidi/logEntryAdded.html'),
                                             readiness_state: :complete

            expect(browsing_context.id).not_to be_nil
            expect(info.navigation_id).nil?
            expect(info.url).to include('/bidi/logEntryAdded.html')
          end
        end

        it 'can get tree with a child' do
          reset_driver!(web_socket_url: true) do |driver|
            browsing_context_id = driver.window_handle
            parent_window = BrowsingContext.new(driver: driver, browsing_context_id: browsing_context_id)
            parent_window.navigate(url: url_for('iframes.html'),
                                   readiness_state: :complete)

            context_info = parent_window.get_tree
            expect(context_info.children.size).eql?(1)
            expect(context_info.id).eql?(browsing_context_id)
            expect(context_info.children[0]["url"]).to include('formPage.html')
          end
        end

        it 'can get tree with depth' do
          reset_driver!(web_socket_url: true) do |driver|
            browsing_context_id = driver.window_handle
            parent_window = BrowsingContext.new(driver: driver, browsing_context_id: browsing_context_id)
            parent_window.navigate(url: url_for('iframes.html'),
                                   readiness_state: :complete)

            context_info = parent_window.get_tree(max_depth: 0)
            expect(context_info.children).to be_nil
            expect(context_info.id).eql?(browsing_context_id)
          end
        end

        it 'can close a window' do
          reset_driver!(web_socket_url: true) do |driver|
            window1 = BrowsingContext.new(driver: driver, type: :window)
            window2 = BrowsingContext.new(driver: driver, type: :window)

            window2.close

            expect { window1.get_tree }.not_to raise_error
            expect { window2.get_tree }.to raise_error(Error::WebDriverError)
          end
        end
      end # BrowsingContext
    end # BiDi
  end # WebDriver
end # Selenium
