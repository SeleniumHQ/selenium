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
      class Bridge < Remote::Bridge
        def initialize(opts = {})
          opts[:desired_capabilities] ||= Remote::Capabilities.firefox

          if opts.key? :proxy
            WebDriver.logger.warn <<-DEPRECATE.gsub(/\n +| {2,}/, ' ').freeze
            [DEPRECATION] `:proxy` is deprecated. Pass in as capability: `Remote::Capabilities.firefox(proxy: #{opts[:proxy]})`
            DEPRECATE
            opts[:desired_capabilities].proxy = opts.delete(:proxy)
          end

          unless opts.key?(:url)
            port = opts.delete(:port) || DEFAULT_PORT
            profile = opts.delete(:profile)

            Binary.path = opts[:desired_capabilities][:firefox_binary] if opts[:desired_capabilities][:firefox_binary]
            @launcher = Launcher.new Binary.new, port, profile
            @launcher.launch
            opts[:url] = @launcher.url
          end

          begin
            super(opts)
          rescue
            @launcher.quit if @launcher
            raise
          end
        end

        def browser
          :firefox
        end

        def driver_extensions
          [DriverExtensions::TakesScreenshot]
        end

        def quit
          super
          nil
        ensure
          @launcher.quit
        end
      end # Bridge
    end # Firefox
  end # WebDriver
end # Selenium
