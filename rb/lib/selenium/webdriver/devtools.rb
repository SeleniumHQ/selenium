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
    class DevTools
      autoload :ConsoleEvent, 'selenium/webdriver/devtools/console_event'
      autoload :ExceptionEvent, 'selenium/webdriver/devtools/exception_event'
      autoload :MutationEvent, 'selenium/webdriver/devtools/mutation_event'
      autoload :NetworkInterceptor, 'selenium/webdriver/devtools/network_interceptor'
      autoload :PinnedScript, 'selenium/webdriver/devtools/pinned_script'
      autoload :Request, 'selenium/webdriver/devtools/request'
      autoload :Response, 'selenium/webdriver/devtools/response'

      def initialize(url:, target_type:)
        @ws = WebSocketConnection.new(url: url)
        @session_id = nil
        start_session(target_type: target_type)
      end

      def close
        @ws.close
      end

      def callbacks
        @ws.callbacks
      end

      def send_cmd(method, **params)
        data = {method: method, params: params.compact}
        data[:sessionId] = @session_id if @session_id
        message = @ws.send_cmd(**data)
        raise Error::WebDriverError, error_message(message['error']) if message['error']

        message
      end

      def method_missing(method, *_args)
        namespace = "Selenium::DevTools::V#{Selenium::DevTools.version}"
        methods_to_classes = "#{namespace}::METHODS_TO_CLASSES"

        desired_class = if Object.const_defined?(methods_to_classes)
                          # selenium-devtools 0.113 and newer
                          "#{namespace}::#{Object.const_get(methods_to_classes)[method]}"
                        else
                          # selenium-devtools 0.112 and older
                          "#{namespace}::#{method.capitalize}"
                        end

        return unless Object.const_defined?(desired_class)

        self.class.class_eval do
          define_method(method) do
            Object.const_get(desired_class).new(self)
          end
        end

        send(method)
      end

      def respond_to_missing?(method, *_args)
        desired_class = "Selenium::DevTools::V#{Selenium::DevTools.version}::#{method.capitalize}"
        Object.const_defined?(desired_class)
      end

      private

      def start_session(target_type:)
        targets = target.get_targets.dig('result', 'targetInfos')
        found_target = targets.find { |target| target['type'] == target_type }
        raise Error::WebDriverError, "Target type '#{target_type}' not found" unless found_target

        session = target.attach_to_target(target_id: found_target['targetId'], flatten: true)
        @session_id = session.dig('result', 'sessionId')
      end

      def error_message(error)
        [error['code'], error['message'], error['data']].join(': ')
      end
    end # DevTools
  end # WebDriver
end # Selenium
