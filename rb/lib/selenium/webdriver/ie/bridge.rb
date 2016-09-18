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
    module IE
      #
      # @api private
      #

      class Bridge < Remote::Bridge
        def initialize(opts = {})
          port = opts.delete(:port) { Service::DEFAULT_PORT }

          @service = Service.new(IE.driver_path, port, *extract_service_args(opts))
          @service.start
          opts[:url] = @service.uri

          caps = opts[:desired_capabilities] ||= Remote::Capabilities.internet_explorer
          caps[:ignore_protected_mode_settings] = true if opts.delete(:introduce_flakiness_by_ignoring_security_domains)
          caps[:native_events] = opts.delete(:native_events) != false

          super(opts)
        end

        def browser
          :internet_explorer
        end

        def driver_extensions
          [DriverExtensions::TakesScreenshot, DriverExtensions::HasInputDevices]
        end

        def quit
          super
        ensure
          @service.stop if @service
        end

        private

        def extract_service_args(opts)
          args = []
          args << "--log-level=#{opts.delete(:log_level).to_s.upcase}" if opts[:log_level]
          args << "--log-file=#{opts.delete(:log_file)}" if opts[:log_file]
          args << "--implementation=#{opts.delete(:implementation).to_s.upcase}" if opts[:implementation]
          args
        end
      end # Bridge
    end # IE
  end # WebDriver
end # Selenium
