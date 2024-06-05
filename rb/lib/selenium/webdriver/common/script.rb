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
    class Script
      def initialize(bridge)
        @log_handler = BiDi::LogHandler.new(bridge.bidi)
      end

      # @return [int] id of the handler
      def add_console_message_handler(&block)
        @log_handler.add_message_handler('console', &block)
      end

      # @return [int] id of the handler
      def add_javascript_error_handler(&block)
        @log_handler.add_message_handler('javascript', &block)
      end

      # @param [int] id of the handler previously added
      def remove_console_message_handler(id)
        @log_handler.remove_message_handler(id)
      end

      alias remove_javascript_error_handler remove_console_message_handler
    end # Script
  end # WebDriver
end # Selenium
