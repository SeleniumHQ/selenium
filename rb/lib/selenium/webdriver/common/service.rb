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
    #
    # Base class implementing default behavior of service object,
    # responsible for storing a service manager configuration.
    #

    class Service
      class << self
        attr_reader :driver_path

        def chrome(**opts)
          Chrome::Service.new(**opts)
        end

        def firefox(**opts)
          Firefox::Service.new(**opts)
        end

        def ie(**opts)
          IE::Service.new(**opts)
        end
        alias internet_explorer ie

        def edge(**opts)
          Edge::Service.new(**opts)
        end
        alias microsoftedge edge
        alias msedge edge

        def safari(**opts)
          Safari::Service.new(**opts)
        end

        def driver_path=(path)
          Platform.assert_executable path if path.is_a?(String)
          @driver_path = path
        end
      end

      attr_accessor :host, :executable_path, :port, :log, :args
      alias extra_args args

      #
      # End users should use a class method for the desired driver, rather than using this directly.
      #
      # @api private
      #

      def initialize(path: nil, port: nil, log: nil, args: nil)
        port ||= self.class::DEFAULT_PORT
        args ||= []

        @executable_path = path
        @host = Platform.localhost
        @port = Integer(port)
        @log = case log
               when :stdout
                 $stdout
               when :stderr
                 $stderr
               else
                 log
               end
        @args = args

        raise Error::WebDriverError, "invalid port: #{@port}" if @port < 1
      end

      def launch
        ServiceManager.new(self).tap(&:start)
      end

      def shutdown_supported
        self.class::SHUTDOWN_SUPPORTED
      end
    end # Service
  end # WebDriver
end # Selenium
