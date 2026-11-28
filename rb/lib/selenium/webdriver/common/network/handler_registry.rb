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
    class Network
      #
      # Holds the authentication handlers and answers the challenges their intercepts block. Each handler has an
      # intercept of its own, and network.authRequired is subscribed to while there is a handler. A challenge's
      # handlers run last added first until one answers it; one that raises cancels the challenge, and its error
      # is raised at the next command.
      #
      # @api private
      #

      class HandlerRegistry
        Handler = Data.define(:intercept, :block, :user_context)
        private_constant :Handler

        def initialize(bridge)
          @network = bridge.bidi_network
          @session = bridge.bidi_session
          @errors = bridge.listener_errors
          @handlers = {}
          @subscription = nil
          @mutex = Mutex.new
          @network.add_auth_required_listener { |params| dispatch(params) }
        end

        def add(block, url_patterns: nil, window_handle: nil, user_context: nil)
          raise ArgumentError, 'a block is required to add a handler' unless block
          if window_handle && user_context
            raise ArgumentError, 'a handler is scoped by a window_handle or a user_context, not both'
          end

          patterns = UrlPatterns.build(url_patterns) || BiDi::Serialization::UNSET
          contexts = window_handle ? [window_handle] : BiDi::Serialization::UNSET
          @mutex.synchronize do
            @subscription ||= @session.subscribe(events: ['network.authRequired']).subscription
            begin
              intercept = @network.add_intercept(phases: [:auth_required], contexts: contexts,
                                                 url_patterns: patterns).intercept
            rescue StandardError
              unsubscribe
              raise
            end
            Object.new.tap { |handle| @handlers[handle] = Handler.new(intercept, block, user_context) }
          end
        end

        # A handle it does not hold is ignored
        def remove(handle)
          @mutex.synchronize do
            handler = @handlers.delete(handle)
            next unless handler

            @network.remove_intercept(intercept: handler.intercept)
            unsubscribe
          end
          nil
        end

        def clear
          handles.each { |handle| remove(handle) }
          nil
        end

        # @return [Array<Object>] in the order they were added
        def handles
          @mutex.synchronize { @handlers.keys }
        end

        def include?(handle)
          @mutex.synchronize { @handlers.key?(handle) }
        end

        # @return [String, nil] the id of the intercept added for the handler
        def intercept(handle)
          @mutex.synchronize { @handlers[handle]&.intercept }
        end

        private

        # By id rather than event name, which would also end the subscriptions of other users of the connection
        def unsubscribe
          return unless @handlers.empty?
          # Safari subscribes without returning an id, so it stays subscribed until the session ends
          return if BiDi::Serialization::UNSET.equal?(@subscription)

          @session.unsubscribe(subscriptions: [@subscription])
          @subscription = nil
        end

        def dispatch(params)
          return unless params.is_blocked

          handlers = @mutex.synchronize do
            # A user context is matched here because intercepts can only be limited to windows
            @handlers.values.select do |handler|
              params.intercepts.include?(handler.intercept) &&
                (handler.user_context.nil? || handler.user_context == params.user_context)
            end
          end
          challenge = AuthenticationChallenge.new(params)
          answer(challenge, consult(challenge, handlers.reverse))
        end

        def consult(challenge, handlers)
          handlers.each do |handler|
            handler.block.call(challenge)
            break if challenge.answer
          end
          challenge.answer || {action: :default}
        # Nothing above a listener thread can handle what escapes it, and test assertions are not StandardErrors
        rescue Exception => e # rubocop:disable Lint/RescueException
          @errors.add(e)
          {action: :cancel}
        end

        # TODO: consider letting users register their own handler for errors their code can neither cause nor prevent
        def answer(challenge, args)
          @network.continue_with_auth(request: challenge.id, **args)
        rescue Error::WebDriverError => e
          WebDriver.logger.error("Could not answer the authentication challenge: #{e.class}: #{e.message}",
                                 id: :network)
        end
      end # HandlerRegistry
    end # Network
  end # WebDriver
end # Selenium
