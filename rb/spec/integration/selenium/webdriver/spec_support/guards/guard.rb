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
    module SpecSupport
      class Guards
        class Guard
          def initialize(guard, type)
            @type = type

            @drivers = []
            @browsers = []
            @platforms = []

            expand_window_manager(guard)
            expand_drivers(guard)
            expand_browsers(guard)
            expand_platforms(guard)
          end

          def except?
            @type == :except
          end

          def only?
            @type == :only
          end

          def exclude?
            @type == :exclude
          end

          def satisfied?
            satisfies_driver? && satisfies_browser? && satisfies_platform? && satisfies_window_manager?
          end

          private

          def expand_window_manager(guard)
            return unless guard.key?(:window_manager)

            @window_manager = guard[:window_manager]
          end

          def expand_drivers(guard)
            return unless guard[:driver]

            @drivers += Array(guard[:driver])
          end

          def expand_browsers(guard)
            return unless guard[:browser]

            @browsers += Array(guard[:browser])
          end

          def expand_platforms(guard)
            return unless guard[:platform]

            @platforms += Array(guard[:platform])
          end

          def satisfies_driver?
            @drivers.empty? || @drivers.include?(GlobalTestEnv.driver)
          end

          def satisfies_browser?
            @browsers.empty? || @browsers.include?(GlobalTestEnv.browser)
          end

          def satisfies_platform?
            @platforms.empty? || @platforms.include?(Platform.os)
          end

          def satisfies_window_manager?
            (!defined?(@window_manager) || @window_manager.nil?) ||
              (@window_manager == (!Selenium::WebDriver::Platform.linux? || !ENV['DESKTOP_SESSION'].nil?))
          end
        end # Guard
      end # Guards
    end # SpecSupport
  end # WebDriver
end # Selenium
