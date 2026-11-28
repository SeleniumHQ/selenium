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
    class Alert
      # Without a prompt it acts on the alert in the window the driver is on; a handler's alert acts on its prompt
      def initialize(bridge, prompt = nil)
        @bridge = bridge
        @prompt = prompt

        # fail fast if the alert doesn't exist
        bridge.alert_text(prompt)
      end

      def accept
        @bridge.accept_alert(@prompt)
      end

      def dismiss
        @bridge.dismiss_alert(@prompt)
      end

      def send_keys(keys)
        @bridge.send_alert_text(keys, @prompt)
      end

      def text
        @bridge.alert_text(@prompt)
      end

      #
      # @return [String] 'alert', 'confirm', 'prompt' or 'beforeunload'
      # @raise [Error::WebDriverError] without BiDi
      #

      def type
        @bridge.alert_type(@prompt)
      end

      #
      # @return [String, nil] the text a prompt opened with
      # @raise [Error::WebDriverError] without BiDi
      #

      def default_value
        @bridge.alert_default_value(@prompt)
      end
    end # Alert
  end # WebDriver
end # Selenium
