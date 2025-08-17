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

module Selenium
  module WebDriver
    class BiDi
      # Implements the browsingContext Module of the WebDriver-BiDi specification
      #
      # @api private
      #
      class BrowsingContext
        READINESS_STATE = {
          'none' => 'none',
          'eager' => 'interactive',
          'normal' => 'complete'
        }.freeze

        # TODO: store current window handle in bridge object instead of always calling it
        def initialize(bridge)
          @bridge = bridge
          @bidi = @bridge.bidi
          page_load_strategy = bridge.capabilities[:page_load_strategy]
          @readiness = READINESS_STATE[page_load_strategy]
        end

        # Navigates to the specified URL in the given browsing context.
        #
        # @param url [String] The URL to navigate to.
        # @param context_id [String, NilClass] The ID of the browsing context to navigate in.
        #   Defaults to the window handle of the current context.
        def navigate(url, context_id: nil)
          context_id ||= @bridge.window_handle
          @bidi.send_cmd('browsingContext.navigate', context: context_id, url: url, wait: @readiness)
        end

        # Traverses the browsing context history by a given delta.
        #
        # @param delta [Integer] The number of steps to traverse.
        #   Positive values go forwards, negative values go backwards.
        # @param context_id [String, NilClass] The ID of the context to traverse.
        #   Defaults to the window handle of the current context.
        def traverse_history(delta, context_id: nil)
          context_id ||= @bridge.window_handle
          @bidi.send_cmd('browsingContext.traverseHistory', context: context_id, delta: delta)
        end

        # Reloads the browsing context.
        # @param [String, NilClass] context_id The ID of the context to reload.
        #   Defaults to the window handle of the current context.
        # @param [Boolean] ignore_cache Whether to bypass the cache when reloading.
        #   Defaults to false.
        def reload(context_id: nil, ignore_cache: false)
          context_id ||= @bridge.window_handle
          params = {context: context_id, ignore_cache: ignore_cache, wait: @readiness}
          @bidi.send_cmd('browsingContext.reload', **params)
        end

        # Closes the browsing context.
        #
        # @param [String] context_id The ID of the context to close.
        #   Defaults to the window handle of the current context.
        def close(context_id: nil)
          context_id ||= @bridge.window_handle
          @bidi.send_cmd('browsingContext.close', context: context_id)
        end

        # Create a new browsing context.
        #
        # @param [Symbol] type The type of browsing context to create.
        #   Valid options are :tab and :window with :window being the default
        # @param [String] context_id The reference context for the new browsing context.
        #   Defaults to the current window handle.
        #
        # @return [String] The context ID of the created browsing context.
        def create(type: nil, context_id: nil)
          type ||= :window
          context_id ||= @bridge.window_handle
          result = @bidi.send_cmd('browsingContext.create', type: type.to_s, referenceContext: context_id)
          result['context']
        end

        def set_viewport(context_id: nil, width: nil, height: nil, device_pixel_ratio: nil)
          context_id ||= @bridge.window_handle
          params = {context: context_id, viewport: {width:, height:}, device_pixel_ratio:}
          @bidi.send_cmd('browsingContext.setViewport', **params)
        end

        def handle_user_prompt(context_id, accept: true, text: nil)
          @bidi.send_cmd('browsingContext.handleUserPrompt', context: context_id, accept: accept, text: text)
        end

        def activate(context_id: nil)
          context_id ||= @bridge.window_handle
          @bidi.send_cmd('browsingContext.activate', context: context_id)
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
