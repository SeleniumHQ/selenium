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
        def driver_extensions
          [DriverExtensions::TakesScreenshot, DriverExtensions::HasInputDevices]
        end

        private

        def bridge_module
          Module.nesting[1]
        end

        def default_capabilities
          Remote::Capabilities.internet_explorer
        end

        def process_deprecations(opts)
          %i[log_level log_file implementation].each do |method|
            next unless opts.key? method
            opts[:service_args] ||= {}

            warn <<-DEPRECATE.gsub(/\n +| {2,}/, ' ').freeze
              [DEPRECATION] Using `#{method}` directly is deprecated.  
              Use `service_args[#{method}] = value`, instead.
            DEPRECATE

            opts[:service_args][method] = opts.delete method
          end

          [:introduce_flakiness_by_ignoring_security_domains, :native_events].each do |method|
            next unless opts.key? method
            opts[:desired_capabilities] ||= default_capabilities

            warn <<-DEPRECATE.gsub(/\n +| {2,}/, ' ').freeze
              [DEPRECATION] Using `#{method}` directly is deprecated.  
              Use `desired_capabilities[#{method}] = value`, instead.
            DEPRECATE

            opts[:desired_capabilities][method] = opts.delete method
          end

          super
        end

        def process_service_args(service_opts)
          return [] unless service_opts
          return service_opts if service_opts.is_a? Array

          service_args = []
          service_args << "--log-level=#{service_opts.delete(:log_level).to_s.upcase}" if service_opts.key?(:log_level)
          service_args << "--log-file=#{service_opts.delete(:log_file)}" if service_opts.key?(:log_file)
          service_args << "--implementation=#{service_opts.delete(:implementation).to_s.upcase}" if service_opts.key?(:implementation)
          service_args << "--host=#{service_opts.delete(:host)}" if service_opts.key?(:host)
          service_args << "--extract_path=#{service_opts.delete(:extract_path)}" if service_opts.key?(:extract_path)
          service_args << "--silent" if service_opts[:silent] == true
          service_args
        end
      end # Bridge
    end # IE
  end # WebDriver
end # Selenium
