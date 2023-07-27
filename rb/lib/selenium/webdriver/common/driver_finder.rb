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

require 'selenium/manager'

module Selenium
  module WebDriver
    class DriverFinder
      class << self
        def path(options, klass)
          path = klass.driver_path
          path = path.call if path.is_a?(Proc)

          unless path || options.is_a?(Remote::Capabilities)
            results = begin
              Selenium::Manager.results(convert_options(options))
            rescue StandardError => e
              raise Error::NoSuchDriverError,
                    "Unable to obtain #{klass::EXECUTABLE} using Selenium Manager; #{e.message}"
            end

            path = process_results(results, options)
          end

          begin
            Platform.assert_executable(path)
          rescue TypeError
            raise Error::NoSuchDriverError, "Unable to locate or obtain #{klass::EXECUTABLE}"
          rescue Error::WebDriverError => e
            raise Error::NoSuchDriverError, "#{klass::EXECUTABLE} located, but: #{e.message}"
          end

          path
        end

        private

        def convert_options(options)
          args = ['--browser', options.browser_name]
          if options.browser_version
            args << '--browser-version'
            args << options.browser_version
          end
          if options.respond_to?(:binary) && !options.binary.nil?
            args << '--browser-path'
            args << options.binary.gsub('\\', '\\\\\\')
          end
          if options.proxy
            args << '--proxy'
            (args << options.proxy.ssl) || options.proxy.http
          end
          args
        end

        def process_results(results, options)
          browser_path = results['browser_path']
          driver_path = results['driver_path']
          Platform.assert_executable driver_path

          if options.respond_to? :binary
            options.binary = browser_path
            options.browser_version = nil
          end

          driver_path
        end
      end
    end
  end
end
