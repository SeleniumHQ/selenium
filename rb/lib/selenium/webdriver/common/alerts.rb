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
    #
    # Handlers for the alerts a page opens in a BiDi session, reached through Driver#alerts.
    #
    # Alerts stay open for the Alert API (Driver#switch_to#alert) unless a handler closes them;
    # while a handler is registered it is called with every alert, including beforeunload prompts.
    # Handlers are added and removed from the thread that drives the browser.
    #

    class Alerts
      # What the opened event reported about an alert, because BiDi has no command that reads one
      #
      # @api private
      class Prompt
        attr_reader :context, :window, :type, :text, :default_value

        # Sent when the prompt is accepted
        attr_accessor :keys

        def initialize(event, window)
          @context = event.context
          @window = window
          @type = event.type.to_s
          @text = event.message
          @default_value = event.default_value unless BiDi::Serialization::UNSET.equal?(event.default_value)
        end
      end

      # Called by Bridge#create_session with the firstMatch entries it is about to send, to change them
      #
      # @api private
      def initialize(bridge, first_match)
        @bridge = bridge
        @handlers = {Object.new => method(:default_handler)}
        @prompts = {}
        @mutex = Mutex.new
        @requested = first_match.map { |candidate| manage_prompts_locally(candidate) }
      end

      #
      # Calls the block with each alert that opens; an alert it leaves open stays open for the Alert API.
      # Only the handler added last is called. It runs on its own thread, so a
      # command sent while it is running does not wait for it.
      #
      # @yieldparam alert [Alert] acts on the alert that opened, whichever window the driver is on
      # @return [Object] the handle to pass to #remove_handler
      #

      def add_handler(&block)
        Object.new.tap { |handle| @mutex.synchronize { @handlers[handle] = block } }
      end

      #
      # @param handle [Object] the handle #add_handler returned
      #

      def remove_handler(handle)
        @mutex.synchronize { @handlers.delete(handle) }
        nil
      end

      # Whether every candidate in the session request asks for BiDi
      # Called by Bridge#create_session
      #
      # @api private
      def bidi_required?
        @requested.all?
      end

      # Safari sends no BiDi user prompt events, so its prompts are left to safaridriver and the classic Alert API
      # Called by BiDiConnection once the session is created
      #
      # @api private
      def handles_prompts?(capabilities)
        !capabilities[:browser_name].to_s.downcase.start_with?('safari')
      end

      # Called by BiDiConnection once the BiDi connection is up
      #
      # @api private
      def subscribe
        listen_prompt_opened
        listen_prompt_closed
        events = BiDi::Protocol::BrowsingContext::EVENTS.fetch_values(:user_prompt_opened, :user_prompt_closed)
        @bridge.bidi_session.subscribe(events: events)
        @bridge.connection.before_send << method(:before_bidi_command)
      end

      # BiDi has no command that reads an open prompt, so the Alert API acts on the one its event reported
      # Called by BiDiConnection for the Alert API
      #
      # @api private
      def current
        @bridge.listener_errors.check
        prompt_in(@bridge.current_window) || raise(Error::NoSuchAlertError, 'no such alert')
      end

      # chromedriver returns from a click that opens a beforeunload prompt while the default handler is accepting
      # it, and refuses the next command until it is closed; returns once it is, so the command is sent again
      # Called by BiDiConnection#execute
      #
      # @api private
      def manage_exception(error)
        raise error if user_handler?
        raise error unless error.is_a?(Error::InvalidArgumentError) && error.message.include?('beforeunload')

        wait_for_beforeunload_to_close
      end

      # Drops the record of a prompt the bridge has closed
      # Called by BiDiConnection
      #
      # @api private
      def forget(prompt)
        # The page may already have opened another prompt in the context
        @mutex.synchronize { @prompts.delete(prompt.window) if @prompts[prompt.window].equal?(prompt) }
      end

      private

      # A BiDi remote end settles a prompt as it opens, before the Alert API or a handler can reach it,
      # so a candidate that asks for BiDi, other than Safari, is sent 'ignore'; returns whether it was
      def manage_prompts_locally(candidate)
        return unless candidate['webSocketUrl'] && !candidate['browserName'].to_s.downcase.start_with?('safari')

        ignore_prompts(candidate)
      end

      def ignore_prompts(candidate)
        if candidate.key?('unhandledPromptBehavior')
          WebDriver.logger.deprecate('unhandledPromptBehavior in a BiDi session (it is ignored)',
                                     'Driver#alerts or the Alert API',
                                     id: :unhandled_prompt_behavior)
        end
        candidate['unhandledPromptBehavior'] = {'default' => 'ignore'}
        true
      end

      def listen_prompt_opened
        @bridge.bidi_browsing_context.add_user_prompt_opened_listener do |event|
          prompt = Prompt.new(event, @bridge.context_tree.top_level(event.context))
          @mutex.synchronize { @prompts[prompt.window] = prompt }
          # Commands sent from here on are checked against this alert before they are sent
          waiting = @bridge.connection.waiting
          handler = @mutex.synchronize { @handlers.values.last }
          handler.call(Alert.new(@bridge, prompt))
        rescue Exception => e # rubocop:disable Lint/RescueException
          @bridge.listener_errors.add(e)
        ensure
          release_commands(prompt, waiting) if waiting
        end
      end

      def listen_prompt_closed
        @bridge.bidi_browsing_context.add_user_prompt_closed_listener do |event|
          window = @bridge.context_tree.top_level(event.context)
          @mutex.synchronize { @prompts.delete(window) }
        end
      end

      def wait_for_beforeunload_to_close
        deadline = Process.clock_gettime(Process::CLOCK_MONOTONIC) + 5
        until Process.clock_gettime(Process::CLOCK_MONOTONIC) > deadline
          return unless @mutex.synchronize { @prompts.each_value.any? { |prompt| prompt.type == 'beforeunload' } }

          sleep 0.05
        end
      end

      # The first handler is the default one
      def user_handler?
        @mutex.synchronize { @handlers.size > 1 }
      end

      # Classic never leaves a beforeunload prompt open
      def default_handler(alert)
        return unless alert.type == 'beforeunload'

        WebDriver.logger.info('Accepting a beforeunload prompt', id: :alerts)
        alert.accept
      end

      # The command that opened an alert left open, such as a navigation or a script, gets no reply until it
      # closes, so it stops waiting as a classic command does
      def release_commands(prompt, waiting)
        return unless @mutex.synchronize { @prompts.value?(prompt) }

        error = Error::InterruptedByAlertError.new("unexpected alert open: {Alert text : #{prompt.text}}")
        # Looked up before release takes the lock the socket reader needs to announce a context
        blocked = waiting.select { |payload| window_of(payload) == prompt.window }
        @bridge.connection.release(error) { |payload| blocked.any? { |sent| sent.equal?(payload) } }
      end

      # A prompt blocks every context in its window, so prompts are kept by window
      def prompt_in(window)
        @mutex.synchronize { @prompts[window] }
      end

      # Remote ends do not refuse commands sent to a context with a prompt open, so they are refused here
      # until they implement https://github.com/w3c/webdriver-bidi/pull/1185
      def before_bidi_command(payload)
        return if payload[:method] == 'browsingContext.handleUserPrompt'

        # The tree waits for a context it has not announced, so it is only consulted while a prompt is open
        return if @mutex.synchronize { @prompts.empty? }

        prompt = prompt_in(window_of(payload))
        return unless prompt
        # The default handler is accepting it
        return wait_for_beforeunload_to_close if prompt.type == 'beforeunload' && !user_handler?

        raise Error::UnexpectedAlertOpenError, "unexpected alert open: {Alert text : #{prompt.text}}"
      end

      def window_of(payload)
        context = context_of(payload)
        @bridge.context_tree.top_level(context) if context
      end

      # Script commands name the context in a target, which may be a realm instead; other commands name it directly
      def context_of(payload)
        params = payload[:params]
        (params['target'] || params)['context'] || legacy_context_of(params)
      end

      # The older BiDi classes send symbol keys
      def legacy_context_of(params)
        (params[:target] || params)[:context]
      end
    end # Alerts
  end # WebDriver
end # Selenium
