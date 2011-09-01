require 'selenium/server'
require 'rake'

module Selenium
  module Rake

    class MissingJarFileError < StandardError
    end

    #
    # Defines rake tasks for starting, stopping and restarting the Selenium server.
    #
    # Usage:
    #
    #   require 'selenium/rake/server_task'
    #
    #   Selenium::Rake::ServerTask.new do |t|
    #     t.jar = "/path/to/selenium-server-standalone.jar"
    #     t.port = 4444
    #     t.opts = %w[-some options]
    #   end
    #
    # Alternatively, you can have the task download a specific version of the server:
    #
    #   Selenium::Rake::ServerTask.new(:server) do |t|
    #     t.version = '2.6.0'
    #   end
    #
    # or the latest version
    #
    #   Selenium::Rake::ServerTask.new(:server) do |t|
    #     t.version = :latest
    #   end
    #
    #
    # Tasks defined:
    #
    #   rake selenium:server:start
    #   rake selenium:server:stop
    #   rake selenium:server:restart
    #

    class ServerTask
      include ::Rake::DSL if defined?(::Rake::DSL)

      #
      # Path to the selenium server jar
      #

      attr_accessor :jar

      #
      # Port to use for the server.
      # Default: 4444
      #
      #

      attr_accessor :port

      #
      # Timeout in seconds for the server to start/stop.
      # Default: 30
      #

      attr_accessor :timeout

      #
      # Whether we should detach from the server process.
      # Default: true
      #

      attr_accessor :background
      alias_method :background?, :background

      #
      # Configure logging. Pass a log file path or a boolean.
      # Default: true
      #
      # true  - log to stdout/stderr
      # false - no logging
      # String - log to the specified file
      #

      attr_accessor :log

      #
      # Add additional options passed to the server jar.
      #

      attr_accessor :opts

      #
      # Specify the version of the server jar to download
      #

      attr_accessor :version


      def initialize(prefix = "selenium:server")
        @jar = nil
        @prefix = prefix
        @port = 4444
        @timeout = 30
        @background = true
        @log = true
        @opts = []
        @version = nil

        yield self if block_given?

        if @version
          @jar = Selenium::Server.download(@version)
        end

        unless @jar
          raise MissingJarFileError, "must provide path to the selenium server jar"
        end

        @server = Selenium::Server.new(@jar, :port       => @port,
                                             :timeout    => @timeout,
                                             :background => @background,
                                             :log        => @log )

        @server << @opts

        define_start_task
        define_stop_task
        define_restart_task
      end

      private

      def define_start_task
        desc "Start the Selenium server"
        task "#{@prefix}:start" do
          @server.start
        end
      end

      def define_stop_task
        desc 'Stop the Selenium server'
        task "#{@prefix}:stop" do
          @server.stop
        end
      end

      def define_restart_task
        desc 'Restart the Selenium server'
        task "#{@prefix}:restart" do
          @server.stop
          @server.start
        end
      end

    end # ServerTask
  end # Rake
end # Selenium
