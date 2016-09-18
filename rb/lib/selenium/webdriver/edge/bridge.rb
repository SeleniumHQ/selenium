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
    module Edge
      #
      # @api private
      #

      class Bridge < Remote::W3CBridge
        def initialize(opts = {})
          port = opts.delete(:port) || Service::DEFAULT_PORT
          service_args = opts.delete(:service_args) || {}
          unless opts.key?(:url)
            @service = Service.new(Edge.driver_path, port, *extract_service_args(service_args))
            @service.host = 'localhost' if @service.host == '127.0.0.1'
            @service.start
            opts[:url] = @service.uri
          end

          opts[:desired_capabilities] ||= Remote::W3CCapabilities.edge

          super(opts)
        end

        def browser
          :edge
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasInputDevices
          ]
        end

        def capabilities
          @capabilities ||= Remote::Capabilities.edge
        end

        def quit
          super
        ensure
          @service.stop if @service
        end

        private

        def extract_service_args(args = {})
          service_args = []
          service_args << "–host=#{args[:host]}" if args.key? :host
          service_args << "–package=#{args[:package]}" if args.key? :package
          service_args << "-verbose" if args[:verbose] == true
          service_args
        end
      end # Bridge
    end # Edge
  end # WebDriver
end # Selenium
