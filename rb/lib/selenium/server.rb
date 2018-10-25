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

require 'childprocess'
require 'selenium/webdriver/common/socket_poller'
require 'net/http'

module Selenium
  #
  # Wraps the remote server jar
  #
  # Usage:
  #
  #   server = Selenium::Server.new('/path/to/selenium-server-standalone.jar')
  #   server.start
  #
  # Automatically download the given version:
  #
  #   server = Selenium::Server.get '2.6.0'
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

    CL_RESET = WebDriver::Platform.windows? ? '' : "\r\e[0K"

    def self.get(required_version, opts = {})
      new(download(required_version), opts)
    end

    #
    # Download the given version of the selenium-server-standalone jar.
    #

    class << self
      def download(required_version)
        required_version = latest if required_version == :latest
        download_file_name = "selenium-server-standalone-#{required_version}.jar"

        return download_file_name if File.exist? download_file_name

        begin
          open(download_file_name, 'wb') do |destination|
            net_http.start('selenium-release.storage.googleapis.com') do |http|
              resp = http.request_get("/#{required_version[/(\d+\.\d+)\./, 1]}/#{download_file_name}") do |response|
                total = response.content_length
                progress = 0
                segment_count = 0

                response.read_body do |segment|
                  progress += segment.length
                  segment_count += 1

                  if (segment_count % 15).zero?
                    percent = (progress.to_f / total.to_f) * 100
                    print "#{CL_RESET}Downloading #{download_file_name}: #{percent.to_i}% (#{progress} / #{total})"
                    segment_count = 0
                  end

                  destination.write(segment)
                end
              end

              unless resp.is_a? Net::HTTPSuccess
                raise Error, "#{resp.code} for #{download_file_name}"
              end
            end
          end
        rescue
          FileUtils.rm download_file_name if File.exist? download_file_name
          raise
        end

        download_file_name
      end

      #
      # Ask Google Code what the latest selenium-server-standalone version is.
      #

      def latest
        require 'rexml/document'
        net_http.start('selenium-release.storage.googleapis.com') do |http|
          versions = REXML::Document.new(http.get('/').body).root.get_elements('//Contents/Key').map do |e|
            e.text[/selenium-server-standalone-(\d+\.\d+\.\d+)\.jar/, 1]
          end

          versions.compact.map { |version| Gem::Version.new(version) }.max.version
        end
      end

      def net_http
        http_proxy = ENV['http_proxy'] || ENV['HTTP_PROXY']

        if http_proxy
          http_proxy = "http://#{http_proxy}" unless http_proxy.start_with?('http://')
          uri = URI.parse(http_proxy)

          Net::HTTP::Proxy(uri.host, uri.port)
        else
          Net::HTTP
        end
      end
    end

    #
    # The server port
    #

    attr_accessor :port

    #
    # The server timeout
    #

    attr_accessor :timeout

    #
    # Whether to launch the server in the background
    #

    attr_accessor :background

    #
    # Path to log file, or 'true' for stdout.
    #

    attr_accessor :log

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

      @jar        = jar
      @host       = '127.0.0.1'
      @port       = opts.fetch(:port, 4444)
      @timeout    = opts.fetch(:timeout, 30)
      @background = opts.fetch(:background, false)
      @log        = opts[:log]

      @additional_args = []
    end

    def start
      process.start
      poll_for_service

      process.wait unless @background
    end

    def stop
      begin
        Net::HTTP.get(@host, '/selenium-server/driver/?cmd=shutDownSeleniumServer', @port)
      rescue Errno::ECONNREFUSED
      end

      stop_process if @process
      poll_for_shutdown

      @log_file.close if defined?(@log_file)
    end

    def webdriver_url
      "http://#{@host}:#{@port}/wd/hub"
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
      return unless @process.alive?

      begin
        @process.poll_for_exit(5)
      rescue ChildProcess::TimeoutError
        @process.stop
      end
    rescue Errno::ECHILD
      # already dead
    ensure
      @process = nil
    end

    def process
      @process ||= (
        # extract any additional_args that start with -D as options
        properties = @additional_args.dup - @additional_args.delete_if { |arg| arg[/^-D/] }
        server_command = ['java'] + properties + ['-jar', @jar, '-port', @port.to_s] + @additional_args
        cp = ChildProcess.build(*server_command)
        WebDriver.logger.debug("Executing Process #{server_command}")

        io = cp.io

        if @log.is_a?(String)
          @log_file = File.open(@log, 'w')
          io.stdout = io.stderr = @log_file
        elsif @log
          io.inherit!
        end

        cp.detach = @background

        cp
      )
    end

    def poll_for_service
      return if socket.connected?
      raise Error, "remote server not launched in #{@timeout} seconds"
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
