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
    module Support
      #
      # Subclass and override methods from this class
      # to implement your own event listener.
      #
      # @example
      #
      #   class NavigationListener < Selenium::WebDriver::Support::AbstractEventListener
      #     def initialize(log)
      #       @log = log
      #     end
      #
      #     def before_navigate_to(url, driver)
      #       @log.info "navigating to #{url}"
      #     end
      #
      #     def after_navigate_to(url, driver)
      #       @log.info "done navigating to #{url}"
      #     end
      #   end
      #
      #   listener = NavigationListener.new(logger)
      #   driver = Selenium::WebDriver.for :firefox, :listener => listener
      #
      #

      class AbstractEventListener
        def before_navigate_to(url, driver) end

        def after_navigate_to(url, driver) end

        def before_navigate_back(driver) end

        def after_navigate_back(driver) end

        def before_navigate_forward(driver) end

        def after_navigate_forward(driver) end

        def before_find(by, what, driver) end

        def after_find(by, what, driver) end

        def before_click(element, driver) end

        def after_click(element, driver) end

        def before_change_value_of(element, driver) end

        def after_change_value_of(element, driver) end

        def before_execute_script(script, driver) end

        def after_execute_script(script, driver) end

        def before_quit(driver) end

        def after_quit(driver) end

        def before_close(driver) end

        def after_close(driver) end
      end # AbstractEventListener
    end # Support
  end # WebDriver
end # Selenium
