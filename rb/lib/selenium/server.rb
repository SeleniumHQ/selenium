require "childprocess"
require "selenium/webdriver/common/socket_poller"
require "net/http"

module Selenium

  #
  # Wraps the remote server jar
  #

  class Server

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
        raise "remote server not launched in #{@timeout} seconds"
      end
    end

    def poll_for_shutdown
      unless socket.closed?
        raise "remote server not stopped in #{@timeout} seconds"
      end
    end

    def socket
      @socket ||= WebDriver::SocketPoller.new(@host, @port, @timeout)
    end

  end # Server
end # Selenium
