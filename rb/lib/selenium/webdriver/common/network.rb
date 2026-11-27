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

require_relative 'network/url_patterns'
require_relative 'network/authentication_challenge'
require_relative 'network/handler_registry'

module Selenium
  module WebDriver
    #
    # Handlers that observe and change the network traffic of a BiDi session, reached through Driver#network.
    #

    class Network
      # @api private
      REFERENCE = 'https://www.selenium.dev/documentation/warnings/bidi-implementation/'

      # @api private
      def initialize(bridge)
        initialize_legacy(bridge)
        @registry = HandlerRegistry.new(bridge)
      end

      #
      # Adds a handler for the authentication challenges of the URLs it applies to. The handler added last is
      # consulted first, until one answers the challenge; a challenge no handler answers is left to the browser.
      # A handler that raises cancels the challenge, and what it raised is raised by the next command.
      #
      # @param username [String] deprecated; use #add_authentication
      # @param password [String] deprecated; use #add_authentication
      # @param filter [Array<String>] deprecated; use url_patterns:
      # @param url_patterns [String, URI, Hash, Array] the URLs the handler applies to; see UrlPatterns
      # @param pattern_type [Symbol] deprecated and ignored; use url_patterns:
      # @param window_handle [String] limits the handler to one window
      # @param user_context [String] limits the handler to the windows of one user context
      # @yieldparam challenge [AuthenticationChallenge]
      # @return [Object] the handle to pass to #remove_authentication_handler
      #

      def add_authentication_handler(username = nil, password = nil, *filter, url_patterns: nil, pattern_type: nil,
                                     window_handle: nil, user_context: nil, &block)
        scope = {url_patterns: url_patterns, window_handle: window_handle, user_context: user_context}
        if username || password || !filter.empty? || pattern_type
          return legacy_authentication_handler(username, password, filter, pattern_type, **scope, &block)
        end

        @registry.add(block, **scope)
      end

      #
      # Answers the authentication challenges of the URLs it applies to with these credentials. It is an
      # authentication handler, consulted in turn with the others.
      #
      # @param username [String]
      # @param password [String]
      # @param url_patterns [String, URI, Hash, Array] the URLs it applies to; see UrlPatterns
      # @param window_handle [String] limits it to one window
      # @param user_context [String] limits it to the windows of one user context
      # @return [Object] the handle to pass to #remove_authentication_handler
      #

      def add_authentication(username:, password:, url_patterns: nil, window_handle: nil, user_context: nil)
        add_authentication_handler(url_patterns: url_patterns, window_handle: window_handle,
                                   user_context: user_context) do |challenge|
          challenge.authenticate(username: username, password: password)
        end
      end

      #
      # Removes the authentication handler a handle was returned for; a handle it no longer holds is ignored.
      #
      # @param handle [Object] what #add_authentication_handler or #add_authentication returned
      #

      def remove_authentication_handler(handle)
        @registry.remove(handle)
      end

      #
      # Removes every authentication handler.
      #

      def clear_authentication_handlers
        @registry.clear
      end

      #
      # Adds a handler for the requests matching the filters. It is given every request sent while it is
      # registered, and must continue, fail or answer the ones it blocked.
      #
      # @param filter [Array<String>] the URLs whose requests are blocked for the handler
      # @param pattern_type [Symbol] :string to match the filters as pattern strings, :url as URL components
      # @yieldparam request [BiDi::InterceptedRequest]
      # @return [Object] the id to pass to #remove_handler
      #

      def add_request_handler(*filter, pattern_type: nil, &block)
        add_handler(
          :before_request,
          BiDi::Network::PHASES[:before_request],
          BiDi::InterceptedRequest,
          filter,
          pattern_type: pattern_type,
          &block
        )
      end

      #
      # Adds a handler for the responses matching the filters. It is given every response received while it is
      # registered, and must continue, fail or replace the ones it blocked.
      #
      # @param filter [Array<String>] the URLs whose responses are blocked for the handler
      # @param pattern_type [Symbol] :string to match the filters as pattern strings, :url as URL components
      # @yieldparam response [BiDi::InterceptedResponse]
      # @return [Object] the id to pass to #remove_handler
      #

      def add_response_handler(*filter, pattern_type: nil, &block)
        add_handler(
          :response_started,
          BiDi::Network::PHASES[:response_started],
          BiDi::InterceptedResponse,
          filter,
          pattern_type: pattern_type,
          &block
        )
      end

      # TODO: deprecate for the remove_*_handler methods once request and response handlers have their own
      #
      # Removes a handler of any kind.
      #
      # @param id [Object] what #add_request_handler, #add_response_handler or #add_authentication_handler returned
      #

      def remove_handler(id)
        return @registry.remove(id) if @registry.include?(id)

        intercept = @callbacks[id]
        @network.remove_intercept(intercept['intercept'])
        @callbacks.delete(id)
      end

      # TODO: deprecate for the clear_*_handlers methods once request and response handlers have their own
      #
      # Removes every handler of every kind.
      #

      def clear_handlers
        @callbacks.each_key { |id| remove_handler(id) }
        @registry.clear
      end

      #
      # @deprecated Keep what each add_*_handler method returns instead.
      # @return [Hash{Object => Hash}] the id of each handler, mapped to the intercept it added
      #

      def callbacks
        WebDriver.logger.deprecate('Network#callbacks', 'what each add_*_handler method returns',
                                   id: :network_callbacks, reference: REFERENCE)
        handles = @registry.handles
        handles.to_h { |handle| [handle, {'intercept' => @registry.intercept(handle)}] }.merge(@callbacks)
      end

      #
      # Answers the authentication challenge of a request with these credentials.
      #
      # @deprecated Use #add_authentication, or #add_authentication_handler to choose credentials per challenge.
      # @param request_id [String] the id the browser gave the request
      # @param username [String]
      # @param password [String]
      #

      def continue_with_auth(request_id, username, password)
        WebDriver.logger.deprecate('Network#continue_with_auth',
                                   'Network#add_authentication or Network#add_authentication_handler',
                                   id: :network_continue_with_auth, reference: REFERENCE)
        @network.continue_with_auth(request_id, username, password)
      end

      # @deprecated Use BiDi::Protocol::Network.new(driver) instead.
      # @return [BiDi::Network]
      def network
        deprecate_network_accessor('Network#network')
      end

      # @deprecated Use BiDi::Protocol::Network.new(driver) instead.
      # @return [BiDi::Network]
      def bidi
        deprecate_network_accessor('Network#bidi')
      end

      private

      # TODO: remove once request and response handlers use HandlerRegistry; #network and #bidi then build
      #   BiDi::Network themselves
      def initialize_legacy(bridge)
        @network = BiDi::Network.new(bridge.bidi)
        @callbacks = {}
      end

      def deprecate_network_accessor(old)
        WebDriver.logger.deprecate(old, 'BiDi::Protocol::Network.new(driver)', id: :network_bidi, reference: REFERENCE)
        @network
      end

      def legacy_authentication_handler(username, password, filter, pattern_type, url_patterns:, window_handle:,
                                        user_context:, &block)
        unless filter.empty? && pattern_type.nil?
          raise ArgumentError, 'give url_patterns: or the deprecated URL filters, not both' if url_patterns

          WebDriver.logger.deprecate('positional URL filters and pattern_type:', 'url_patterns:',
                                     id: :network_url_filters, reference: REFERENCE)
          url_patterns = filter unless filter.empty?
        end
        scope = {url_patterns: url_patterns, window_handle: window_handle, user_context: user_context}
        return add_authentication_handler(**scope, &block) unless username && password

        WebDriver.logger.deprecate('Network#add_authentication_handler with a username and password',
                                   'Network#add_authentication(username:, password:)',
                                   id: :network_auth_credentials, reference: REFERENCE)
        add_authentication(username: username, password: password, **scope)
      end

      # TODO: remove once request and response handlers use HandlerRegistry
      def add_handler(event_type, phase, intercept_type, filter, pattern_type: nil)
        intercept = @network.add_intercept(phases: [phase], url_patterns: [filter].flatten, pattern_type: pattern_type)
        callback_id = @network.on(event_type) do |event|
          request = event['request']
          intercepted_item = intercept_type.new(@network, request)
          yield(intercepted_item)
        end

        @callbacks[callback_id] = intercept
        callback_id
      end
    end # Network
  end # WebDriver
end # Selenium
