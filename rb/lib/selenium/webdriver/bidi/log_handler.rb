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
      class LogHandler
        ConsoleLogEntry = BiDi::Struct.new(:level, :text, :timestamp, :method, :args, :type)
        JavaScriptLogEntry = BiDi::Struct.new(:level, :text, :timestamp, :stack_trace, :type)

        def initialize(bidi)
          @bidi = bidi
          @log_entry_subscribed = false
        end

        # @return [int] id of the handler
        def add_message_handler(type)
          subscribe_log_entry unless @log_entry_subscribed
          @bidi.add_callback('log.entryAdded') do |params|
            if params['type'] == type
              log_entry_klass = type == 'console' ? ConsoleLogEntry : JavaScriptLogEntry
              yield(log_entry_klass.new(**params))
            end
          end
        end

        # @param [int] id of the handler previously added
        def remove_message_handler(id)
          @bidi.remove_callback('log.entryAdded', id)
          unsubscribe_log_entry if @log_entry_subscribed && @bidi.callbacks['log.entryAdded'].empty?
        end

        private

        def subscribe_log_entry
          @bidi.session.subscribe('log.entryAdded')
          @log_entry_subscribed = true
        end

        def unsubscribe_log_entry
          @bidi.session.unsubscribe('log.entryAdded')
          @log_entry_subscribed = false
        end
      end # LogHandler
    end # Bidi
  end # WebDriver
end # Selenium
