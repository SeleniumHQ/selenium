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
    class Wait
      DEFAULT_TIMEOUT  = 5
      DEFAULT_INTERVAL = 0.2

      #
      # Create a new Wait instance
      #
      # @param [Hash] opts Options for this instance
      # @option opts [Numeric] :timeout (5) Seconds to wait before timing out.
      # @option opts [Numeric] :interval (0.2) Seconds to sleep between polls.
      # @option opts [String] :message Exception mesage if timed out.
      # @option opts [Array, Exception] :ignore Exceptions to ignore while polling (default: Error::NoSuchElementError)
      #

      def initialize(opts = {})
        @timeout  = opts.fetch(:timeout, DEFAULT_TIMEOUT)
        @interval = opts.fetch(:interval, DEFAULT_INTERVAL)
        @message  = opts[:message]
        @ignored  = Array(opts[:ignore] || Error::NoSuchElementError)
      end

      #
      # Wait until the given block returns a true value.
      #
      # @raise [Error::TimeoutError]
      # @return [Object] the result of the block
      #

      def until
        end_time = current_time + @timeout
        last_error = nil

        until current_time > end_time
          begin
            result = yield
            return result if result
          rescue *@ignored => last_error # rubocop:disable Naming/RescuedExceptionsVariableName
            # swallowed
          end

          sleep @interval
        end

        msg = if @message
                @message.dup
              else
                +"timed out after #{@timeout} seconds"
              end

        msg << " (#{last_error.message})" if last_error

        raise Error::TimeoutError, msg
      end

      private

      def current_time
        Process.clock_gettime(Process::CLOCK_MONOTONIC)
      end
    end # Wait
  end # WebDriver
end # Selenium
