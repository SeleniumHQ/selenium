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

require 'selenium/webdriver/bidi'

module Selenium
  module WebDriver
    module Remote
      # @api private
      module BiDiConnection
        attr_reader :bidi, :connection, :context_tree, :listener_errors

        # A stored error is raised once the session has ended, and outside Bridge#quit's rescue of connection errors
        def quit
          bidi&.close
        rescue *Bridge::QUIT_ERRORS
          nil
        ensure
          super
          @listener_errors.check
        end

        def close
          execute(:close_window).tap { |handles| bidi.close if handles.empty? }
        end

        # BiDiPrompts replaces these, except for a browser that sends no BiDi user prompt events
        def alerts(*)
          raise Error::WebDriverError,
                "#{@capabilities.browser_name} does not send the BiDi user prompt events alerts need"
        end
        alias alert_type alerts
        alias alert_default_value alerts

        private

        def connect_bidi(alerts)
          @listener_errors = ListenerErrors.new
          handle_prompts(alerts) if alerts.handles_prompts?(@capabilities)

          begin
            @bidi = Selenium::WebDriver::BiDi.new(url: validated_socket_url)
            # Reuse the BiDi object's socket as the connection until the bridge owns it directly.
            @connection = @bidi.ws
            @connection.before_send << ->(_payload) { @listener_errors.check }
            @context_tree = BiDi::ContextTree.new(@connection)
            @current_window = window_handle
            @alerts&.subscribe
          rescue StandardError
            quit
            raise
          end
        end

        def handle_prompts(alerts)
          extend(BiDiPrompts)

          @alerts = alerts
          # The remote end reports the 'ignore' it was sent, which is not what applies
          @capabilities[:unhandled_prompt_behavior] = nil
        end

        def execute(command, *)
          @listener_errors.check unless command == :delete_session
          super
        end

        def validated_socket_url
          url = @capabilities[:web_socket_url]
          return url if url.is_a?(String) && url.start_with?('ws://', 'wss://')

          raise Error::WebDriverError,
                "BiDi was enabled, but the remote end did not return a valid webSocketUrl: #{url.inspect}."
        end
      end # BiDiConnection
    end # Remote
  end # WebDriver
end # Selenium
