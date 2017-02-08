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
    module Chrome
      # @api private
      class Bridge < Remote::OSSBridge
        def driver_extensions
          [DriverExtensions::TakesScreenshot,
           DriverExtensions::HasInputDevices,
           DriverExtensions::HasWebStorage]
        end

        private

        def bridge_module
          Module.nesting[1]
        end

        def process_deprecations(opts)
          if opts[:service_log_path]
            opts[:service_args] ||= {}
            warn <<-DEPRECATE.gsub(/\n +| {2,}/, ' ').freeze
              [DEPRECATION] Using `:service_log_path` directly is deprecated.  
              Use `service_args[:service_log_path] = value`, instead.
            DEPRECATE

            opts[:service_args][:service_log_path] = opts.delete :service_log_path
          end

          [:args, :switches, :detach, :prefs].each do |method|
            next unless opts.key? method
            opts[:options] ||= {}

            warn <<-DEPRECATE.gsub(/\n +| {2,}/, ' ').freeze
              [DEPRECATION] Using `#{method}` directly is deprecated.  
              Use `options[#{method}] = value`, instead.
            DEPRECATE

            opts[:options][method.to_s] = opts.delete method
          end

          super
        end

        def process_service_args(service_opts)
          return [] unless service_opts
          return service_opts if service_opts.is_a? Array

          service_args = []
          service_args << "--log-path=#{service_opts[:service_log_path]}" if service_opts.key?(:service_log_path)

          # comma-separated list of remote IPv4 addresses
          if service_opts.key?(:whitelisted_ips)
            service_args << "--whitelisted-ips=#{service_opts[:whitelisted_ips].join(',')}"
          end

          if service_opts[:verbose] == true
            service_args << "--verbose"
          elsif service_opts[:silent] == true
            service_args << "--silent"
          end

          service_args
        end
      end # Bridge
    end # Chrome
  end # WebDriver
end # Selenium
