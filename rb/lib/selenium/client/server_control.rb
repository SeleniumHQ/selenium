require "childprocess"

module Selenium
  module Client

    class ServerControl
      attr_reader :host, :port, :timeout_in_seconds, :firefox_profile, :shutdown_command
      attr_accessor :additional_args, :jar_file, :log_to

      def initialize(host, port, options={})
        @host, @port = host, port
        @timeout_in_seconds = options[:timeout] || (2 * 60)
        @shutdown_command = options[:shutdown_command] || "shutDownSeleniumServer"
        @firefox_profile = options[:firefox_profile]
        @additional_args = options[:additional_args] || []
      end

      def start(options = {})
        command = [
          "java"    , "-jar", jar_file.to_s,
          "-port"   , @port.to_s,
          "-timeout", @timeout_in_seconds.to_s
        ]

        command += ["-firefoxProfileTemplate", @firefox_profile.to_S] if @firefox_profile
        command += additional_args.map { |e| e.to_s } unless additional_args.empty?

        @process = ChildProcess.build(*command)

        io = @process.io
        if log_to && !options[:background] # TODO: find a way to work around this?
          @log_file = File.open(log_to, "w")
          io.stdout = io.stderr = @log_file
        else
          io.inherit!
        end

        @process.detach = !!options[:background]
        @process.start
      end

      def stop
        Net::HTTP.get(@host, "/selenium-server/driver/?cmd=#{shutdown_command}", @port)

        if @process
          begin
            @process.poll_for_exit(5)
          rescue ChildProcess::TimeoutError
            @process.stop
          end
        end

        @log_file.close if @log_file
      end

      def wait_for_termination
        TCPSocket.wait_for_service_termination :host => @host, :port => @port
      end

      def wait_for_service
        TCPSocket.wait_for_service :host => @host, :port => @port
      end

    end

  end
end
