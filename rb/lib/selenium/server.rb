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

  class Server
    class Error < StandardError; end

    CL_RESET = WebDriver::Platform.windows? ? '' : "\r\e[0K"

    def self.get(required_version, opts = {})
      new(download(required_version), opts)
    end

    #
    # Download the given version of the selenium-server-standalone jar.
    #

    def self.download(required_version)
      required_version = latest if required_version == :latest
      download_file_name = "selenium-server-standalone-#{required_version}.jar"

      if File.exists? download_file_name
        return download_file_name
      end

      begin
        open(download_file_name, "wb") do |destination|
          net_http.start("selenium.googlecode.com") do |http|
            resp = http.request_get("/files/#{download_file_name}") do |response|
              total = response.content_length
              progress = 0
              segment_count = 0

              response.read_body do |segment|
                progress += segment.length
                segment_count += 1

                if segment_count % 15 == 0
                  percent = (progress.to_f / total.to_f) * 100
                  print "#{CL_RESET}Downloading #{download_file_name}: #{percent.to_i}% (#{progress} / #{total})"
                  segment_count = 0
                end

                destination.write(segment)
              end
            end

            unless resp.kind_of? Net::HTTPSuccess
              raise Error, "#{resp.code} for #{download_file_name}"
            end
          end
        end
      rescue
        FileUtils.rm download_file_name if File.exists? download_file_name
        raise
      end

      download_file_name
    end

    #
    # Ask Google Code what the latest selenium-server-standalone version is.
    #

    def self.latest
      net_http.start("code.google.com") do |http|
        resp = http.get("/p/selenium/downloads/list")
        resp.body.to_s[/selenium-server-standalone-(\d+.\d+.\d+).jar/, 1]
      end
    end

    def initialize(jar, opts = {})
      raise Errno::ENOENT, jar unless File.exist?(jar)

      @jar        = jar
      @host       = "127.0.0.1"
      @port       = opts.fetch(:port, 4444)
      @timeout    = opts.fetch(:timeout, 30)
      @background = opts.fetch(:background, false)
      @log        = opts[:log]

      @additional_args = []
    end

    def start
      process.start
      poll_for_service

      unless @background
        begin
          sleep 1 while process.alive?
        rescue Errno::ECHILD
          # no longer alive
        end
      end
    end

    def stop
      begin
        Net::HTTP.get(@host, "/selenium-server/driver/?cmd=shutDownSeleniumServer", @port)
      rescue Errno::ECONNREFUSED
      end

      stop_process if @process
      poll_for_shutdown

      @log_file.close if @log_file
    end

    def webdriver_url
      "http://#{@host}:#{@port}/wd/hub"
    end

    def <<(arg)
      if arg.kind_of?(Array)
        @additional_args += arg
      else
        @additional_args << arg.to_s
      end
    end

    private

    def self.net_http
      if ENV['http_proxy']
        http_proxy = ENV['http_proxy']
        http_proxy = "http://#{http_proxy}" unless http_proxy =~ /^http:\/\//i
        uri = URI.parse(http_proxy)

        Net::HTTP::Proxy(uri.host, uri.port)
      else
        Net::HTTP
      end
    end

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
        cp = ChildProcess.build("java", "-jar", @jar, "-port", @port.to_s, *@additional_args)
        io = cp.io

        if @log.kind_of?(String) && !@background
          @log_file = File.open(@log, "w")
          io.stdout = io.stderr = @log_file
        elsif @log
          io.inherit!
        end

        cp.detach = @background

        cp
      )
    end

    def poll_for_service
      unless socket.connected?
        raise Error, "remote server not launched in #{@timeout} seconds"
      end
    end

    def poll_for_shutdown
      unless socket.closed?
        raise Error, "remote server not stopped in #{@timeout} seconds"
      end
    end

    def socket
      @socket ||= WebDriver::SocketPoller.new(@host, @port, @timeout)
    end

  end # Server
end # Selenium
