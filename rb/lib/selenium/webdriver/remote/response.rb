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
    module Remote

      #
      # @api private
      #

      class Response
        attr_reader :code, :payload

        def initialize(code, payload = nil)
          @code    = code
          @payload = payload || {}

          assert_ok
        end

        def error
          error, message, backtrace = process_error
          klass = Error.for_error(error) || return

          ex = klass.new(message)
          ex.set_backtrace(caller)
          add_backtrace ex, backtrace

          ex
        end

        def [](key)
          @payload[key]
        end

        private

        def assert_ok
          e = error
          raise e if e
          return unless @code.nil? || @code >= 400

          raise Error::ServerError, self
        end

        def add_backtrace(ex, server_trace)
          return unless server_trace

          backtrace = case server_trace
                      when Array
                        backtrace_from_remote(server_trace)
                      when String
                        server_trace.split("\n")
                      end

          ex.set_backtrace(backtrace + ex.backtrace)
        end

        def backtrace_from_remote(server_trace)
          server_trace.map { |frame|
            next unless frame.is_a?(Hash)

            file = frame['fileName']
            line = frame['lineNumber']
            meth = frame['methodName']

            class_name = frame['className']
            file = "#{class_name}(#{file})" if class_name

            meth = 'unknown' if meth.nil? || meth.empty?

            "[remote server] #{file}:#{line}:in `#{meth}'"
          }.compact
        end

        def process_error
          return unless self['value'].is_a?(Hash)

          [
            self['value']['error'],
            self['value']['message'],
            self['value']['stacktrace']
          ]
        end
      end # Response
    end # Remote
  end # WebDriver
end # Selenium
