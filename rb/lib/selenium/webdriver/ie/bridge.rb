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
          port = opts.delete(:port) || Service::DEFAULT_PORT
          service_args = opts.delete(:service_args) || {}
          service_args = match_legacy(opts, service_args)
          @service = Service.new(IE.driver_path, port, *extract_service_args(service_args))
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

        def match_legacy(opts, args)
          args[:log_level] = opts.delete(:log_level) if opts.key?(:log_level)
          args[:log_file] = opts.delete(:log_file) if opts.key?(:log_file)
          args[:implementation] = opts.delete(:implementation) if opts.key?(:implementation)
          args
        end

        def extract_service_args(args)
          service_args = []
          service_args << "--log-level=#{args.delete(:log_level).to_s.upcase}" if args.key?(:log_level)
          service_args << "--log-file=#{args.delete(:log_file)}" if args.key?(:log_file)
          service_args << "--implementation=#{args.delete(:implementation).to_s.upcase}" if args.key?(:implementation)
          service_args
        end
      end # Bridge
    end # IE
  end # WebDriver
end # Selenium
