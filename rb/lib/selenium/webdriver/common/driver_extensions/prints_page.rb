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
    module DriverExtensions
      module PrintsPage
        #
        # Save a page as a PDF to the given path
        #
        # @example Save Printed Page
        #   driver.save_print_page('../printed_page.pdf')
        #
        # @param [String] path to where the pdf should be saved
        #
        # @api public
        #

        def save_print_page(path, **options)
          File.open(path, 'wb') do |file|
            content = Base64.decode64 print_page(**options)
            file << content
          end
        end

        #
        # Return a Base64 encoded Print Page as a string
        #
        # @see https://w3c.github.io/webdriver/#print-page
        #
        # @api public
        #

        def print_page(**options)
          options[:pageRanges] = Array(options.delete(:page_ranges)) || []
          options[:shrinkToFit] = options.delete(:shrink_to_fit) { true }

          @bridge.print_page(options)
        end
      end # PrintsPage
    end # DriverExtensions
  end # WebDriver
end # Selenium
