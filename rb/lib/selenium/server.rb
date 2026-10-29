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

require 'selenium/webdriver/common/child_process'
require 'selenium/webdriver/common/port_prober'
require 'selenium/webdriver/common/socket_poller'
require 'selenium/webdriver/common/selenium_manager'
require 'net/http'
require 'json'

module Selenium
  #
  # Wraps the remote server jar
  #
  # Usage:
  #
  #   server = Selenium::Server.new('/path/to/selenium-server-standalone.jar')
  #   server.start
  #
  # Automatically download the given version with Selenium Manager:
  #
  #   server = Selenium::Server.get '4.30.0'
  #   server.start
  #
  # or the latest version:
  #
  #   server = Selenium::Server.get :latest
  #   server.start
  #
  # Run the server in the background:
  #
  #   server = Selenium::Server.new(jar, :background => true)
  #   server.start
  #
  # Add additional arguments:
  #
  #   server = Selenium::Server.new(jar)
  #   server << ["--additional", "args"]
  #   server.start
  #

  class Server
    class Error < StandardError; end

    class << self
      #
      # Download the given version of the selenium-server jar and return instance
      #
      # @param [String, Symbol] required_version X.Y.Z defaults to ':latest'
      # @param [Hash] opts
      # @return [Selenium::Server]
      #

      def get(required_version = :latest, opts = {})
        new(download(required_version), opts)
      end

      #
      # Download the given version of the selenium-server jar with Selenium Manager and return location
      #
      # @param [String, Symbol] required_version X.Y.Z defaults to ':latest'
      # @return [String] location of downloaded file
      # @raise [Selenium::Server::Error] if Selenium Manager cannot provide the jar
      #

      def download(required_version = :latest)
        arguments = ['--grid']
        unless required_version == :latest
          download_file_name = "selenium-server-#{required_version}.jar"
          return download_file_name if File.exist? download_file_name

          arguments << required_version.to_s
        end

        cached_jar = WebDriver::SeleniumManager.binary_paths(*arguments)['driver_path']
        if cached_jar.to_s.empty?
          offline_source = ENV['SE_OFFLINE'] == 'true' ? 'SE_OFFLINE is true' : 'offline is true in se-config.toml'
          message = "Selenium Manager is in offline mode (#{offline_source}) "
          raise Error, message + "and has no cached selenium-server #{required_version}"
        end

        download_file_name = File.basename(cached_jar)
        FileUtils.cp(cached_jar, download_file_name) unless File.exist? download_file_name

        download_file_name
      rescue WebDriver::Error::WebDriverError => e
        raise Error, e.message
      end

      #
      # Download the latest selenium-server jar with Selenium Manager and return its version
      #
      # @return [String] X.Y.Z
      #

      def latest
        download[/selenium-server-(\d+\.\d+\.\d+)\.jar/, 1]
      end
    end

    #
    # The Mode of the Server
    # :standalone, #hub, #node
    #

    attr_accessor :role, :host, :port, :timeout, :background, :log

    #
    # @param [String] jar Path to the server jar.
    # @param [Hash] opts the options to create the server process with
    #
    # @option opts [Integer] :port Port the server should listen on (default: 4444).
    # @option opts [Integer] :timeout Seconds to wait for server launch/shutdown (default: 30)
    # @option opts [true,false] :background Run the server in the background (default: false)
    # @option opts [true,false,String] :log Either a path to a log file,
    #                                      or true to pass server log to stdout.
    # @raise [Errno::ENOENT] if the jar file does not exist
    #

    def initialize(jar, opts = {})
      raise Errno::ENOENT, jar unless File.exist?(jar)

      @java = opts.fetch(:java, 'java') || 'java'
      @jar = jar
      @host = '127.0.0.1'
      @role = opts.fetch(:role, 'standalone')
      @port = opts.fetch(:port, WebDriver::PortProber.above(4444))
      @timeout = opts.fetch(:timeout, 30)
      @background = opts.fetch(:background, false)
      @additional_args = opts.fetch(:args, [])
      @log = opts[:log]
      if opts[:log_level]
        @log ||= true
        @additional_args << '--log-level'
        @additional_args << opts[:log_level].to_s
      end

      @log_file = nil
    end

    def start
      process.start
      poll_for_ready

      process.wait unless @background
    end

    def stop
      stop_process if @process
      poll_for_shutdown

      @log_file&.close
    end

    def webdriver_url
      "http://#{@host}:#{@port}/wd/hub"
    end

    def status_ok?
      return false unless @process&.alive? && socket_connected?

      Net::HTTP.start(@host, @port, open_timeout: 2, read_timeout: 2) do |http|
        response = http.get('/status')
        return false unless response.is_a?(Net::HTTPSuccess)

        status = JSON.parse(response.body)
        status.dig('value', 'ready') == true
      end
    rescue StandardError
      false
    end

    def <<(arg)
      if arg.is_a?(Array)
        @additional_args += arg
      else
        @additional_args << arg.to_s
      end
    end

    private

    def stop_process
      @process.stop
    rescue Errno::ECHILD
      # already dead
    ensure
      @process = nil
    end

    def process
      @process ||= begin
        # extract any additional_args that start with -D as options
        properties = @additional_args.dup - @additional_args.delete_if { |arg| arg[/^-D/] }
        args = ['-jar', @jar, @role, '--port', @port.to_s]
        server_command = [@java] + properties + args + @additional_args
        cp = WebDriver::ChildProcess.build(*server_command)

        if @log.is_a?(String)
          cp.io = @log
        elsif @log
          cp.io = :out
        end

        cp.detach = @background

        cp
      end
    end

    def poll_for_ready
      start_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      loop do
        return if status_ok?

        elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - start_time
        raise Error, "remote server not ready in #{@timeout} seconds" if elapsed > @timeout

        sleep 0.5
      end
    end

    def socket_connected?
      @socket_connected ||= socket.connected?
    end

    def poll_for_shutdown
      return if socket.closed?

      raise Error, "remote server not stopped in #{@timeout} seconds"
    end

    def socket
      @socket ||= WebDriver::SocketPoller.new(@host, @port, @timeout)
    end
  end # Server
end # Selenium
