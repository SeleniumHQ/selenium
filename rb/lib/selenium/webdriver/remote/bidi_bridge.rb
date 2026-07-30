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
require 'selenium/webdriver/bidi/protocol'

module Selenium
  module WebDriver
    module Remote
      class BiDiBridge < Bridge
        attr_reader :bidi, :connection

        READINESS_STATE = {
          'none' => :none,
          'eager' => :interactive,
          'normal' => :complete
        }.freeze

        def create_session(capabilities)
          super

          begin
            @bidi = Selenium::WebDriver::BiDi.new(url: validated_socket_url)
            # Reuse the BiDi object's socket as the connection until the bridge owns it directly.
            @connection = @bidi.ws
          rescue StandardError
            quit
            raise
          end
        end

        def get(url)
          browsing_context.navigate(context: window_handle, url: url, wait: readiness_state)
          nil
        end

        def go_back
          browsing_context.traverse_history(context: window_handle, delta: -1)
          nil
        end

        def go_forward
          browsing_context.traverse_history(context: window_handle, delta: 1)
          nil
        end

        def refresh
          browsing_context.reload(context: window_handle, wait: readiness_state)
          nil
        end

        def quit
          bidi&.close
        rescue *QUIT_ERRORS
          nil
        ensure
          super
        end

        def close
          execute(:close_window).tap { |handles| bidi.close if handles.empty? }
        end

        private

        def validated_socket_url
          url = @capabilities[:web_socket_url]
          return url if url.is_a?(String) && url.start_with?('ws://', 'wss://')

          raise Error::WebDriverError,
                "BiDi was enabled, but the remote end did not return a valid webSocketUrl: #{url.inspect}."
        end

        def browsing_context
          @browsing_context ||= BiDi::Protocol::BrowsingContext.new(connection)
        end

        def readiness_state
          READINESS_STATE.fetch(capabilities[:page_load_strategy] || 'normal')
        end
      end # BiDiBridge
    end # Remote
  end # WebDriver
end # Selenium
