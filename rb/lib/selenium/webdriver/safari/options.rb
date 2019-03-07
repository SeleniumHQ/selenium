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
    module Safari
      class Options
        attr_accessor :automatic_inspection, :automatic_profiling

        #
        # Create a new Options instance for W3C-capable versions of Safari.
        #
        # @example
        #   options = Selenium::WebDriver::Safari::Options.new(automatic_inspection: true)
        #   driver = Selenium::WebDriver.for :safari, options: options
        #
        # @param [Hash] opts the pre-defined options to create the Safari::Options with
        # @option opts [Boolean] :automatic_inspection Preloads Web Inspector and JavaScript debugger. Default is false
        # @option opts [Boolean] :automatic_profiling Preloads Web Inspector and starts a timeline recording. Default is false
        #
        # @see https://developer.apple.com/documentation/webkit/about_webdriver_for_safari
        #

        def initialize(**opts)
          @automatic_inspection = opts.delete(:automatic_inspection) || false
          @automatic_profiling = opts.delete(:automatic_profiling) || false
        end

        #
        # @api private
        #

        def as_json(*)
          opts = {}

          opts['safari:automaticInspection'] = true if @automatic_inspection
          opts['safari:automaticProfiling'] = true if @automatic_profiling

          opts
        end
      end # Options
    end # Safari
  end # WebDriver
end # Selenium
