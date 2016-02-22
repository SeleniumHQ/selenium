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
  module Client

    module SeleniumHelper

      # Overrides default open method to actually delegates to @selenium
      def open(url)
        @selenium.open url
      end

      # Overrides default type method to actually delegates to @selenium
      def type(locator, value)
        @selenium.type locator, value
      end

      # Overrides default select method to actually delegates to @selenium
      def select(input_locator, option_locator)
        @selenium.select input_locator, option_locator
      end

      # Delegates to @selenium on method missing
      def method_missing(method_name, *args)
        return super unless @selenium.respond_to?(method_name)

        @selenium.send(method_name, *args)
      end
    end

  end
end
