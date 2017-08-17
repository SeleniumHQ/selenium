# encoding: utf-8
#
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
      # @api private
      class Response
        STACKTRACE_KEY = 'stackTrace'.freeze

        attr_reader :code, :payload
        attr_writer :payload

        def initialize(code, payload = nil)
          @code    = code
          @payload = payload || {}

          assert_ok
        end

        def error
          klass = Error.for_code(status) || return

          ex = klass.new(error_message)
          ex.set_backtrace(caller)
          add_backtrace ex

          ex
        end

        def error_message
          val = value

          case val
          when Hash
            msg = val['message']
            return 'unknown error' unless msg
            msg << ": #{val['alert']['text'].inspect}" if val['alert'].is_a?(Hash) && val['alert']['text']
            msg << " (#{val['class']})" if val['class']
            msg
          when String
            val
          else
            "unknown error, status=#{status}: #{val.inspect}"
          end
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

        def add_backtrace(ex)
          return unless error_payload.is_a?(Hash)

          server_trace = error_payload[STACKTRACE_KEY] ||
                         error_payload[STACKTRACE_KEY.downcase] ||
                         error_payload['value'][STACKTRACE_KEY]
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
          server_trace.map do |frame|
            next unless frame.is_a?(Hash)

            file = frame['fileName']
            line = frame['lineNumber']
            meth = frame['methodName']

            class_name = frame['className']
            file = "#{class_name}(#{file})" if class_name

            meth = 'unknown' if meth.nil? || meth.empty?

            "[remote server] #{file}:#{line}:in `#{meth}'"
          end.compact
        end

        def error_payload
          # Even errors are wrapped in 'value' for w3c
          # Grab 'value' key for error, leave original payload alone and let the bridge process
          @error_payload ||= !@payload.key?('sessionId') ? @payload['value'] : @payload
        end

        def status
          return unless error_payload.is_a? Hash
          @status ||= error_payload['status'] || error_payload['error']
        end

        def value
          return unless error_payload.is_a? Hash
          @value ||= error_payload['value'] || error_payload['message']
        end
      end # Response
    end # Remote
  end # WebDriver
end # Selenium
