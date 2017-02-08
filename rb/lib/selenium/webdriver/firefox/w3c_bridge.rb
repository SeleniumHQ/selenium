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
    module Firefox
      # @api private
      class W3CBridge < Remote::W3CBridge
        def driver_extensions
          [DriverExtensions::TakesScreenshot,
           DriverExtensions::HasInputDevices,
           DriverExtensions::HasWebStorage]
        end

        private

        def bridge_module
          Module.nesting[1]
        end

        def default_capabilities
          Remote::W3CCapabilities.firefox
        end

        def process_service_args(service_opts)
          return [] unless service_opts
          return service_opts if service_opts.is_a? Array

          service_args = []
          service_args << "--binary=#{service_opts[:binary]}" if service_opts.key?(:binary)
          service_args << "–-log=#{service_opts[:log]}" if service_opts.key?(:log)
          service_args << "–-marionette-port=#{service_opts[:marionette_port]}" if service_opts.key?(:marionette_port)
          service_args << "–-host=#{service_opts[:host]}" if service_opts.key?(:host)
          service_args << "–-port=#{service_opts[:port]}" if service_opts.key?(:port)
          service_args
        end

      end # W3CBridge
    end # Firefox
  end # WebDriver
end # Selenium
