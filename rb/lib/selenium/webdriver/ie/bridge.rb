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
          caps           = opts.delete(:desired_capabilities) { Remote::Capabilities.internet_explorer }
          port           = opts.delete(:port) { Service::DEFAULT_PORT }
          http_client    = opts.delete(:http_client)
          ignore_mode    = opts.delete(:introduce_flakiness_by_ignoring_security_domains)
          native_events  = opts.delete(:native_events) != false

          @service = Service.new(IE.driver_path, port, *extract_service_args(opts))

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          @service.start

          caps['ignoreProtectedModeSettings'] = true if ignore_mode
          caps['nativeEvents'] = native_events

          remote_opts = {
            url: @service.uri,
            desired_capabilities: caps
          }
          remote_opts[:http_client] = http_client if http_client

          super(remote_opts)
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
