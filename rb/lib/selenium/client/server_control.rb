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
        @shell = Selenium::Client::Shell.new
      end

      def start(options = {})
        command = "java -jar \"#{jar_file}\""
        command << " -port #{@port}"
        command << " -timeout #{@timeout_in_seconds}"
        command << " -firefoxProfileTemplate '#{@firefox_profile}'" if @firefox_profile
        command << " #{additional_args.join(' ')}" unless additional_args.empty?
        command << " > #{log_to}" if log_to

        @shell.run command, {:background => options[:background], :nohup => options[:nohup]}
      end

      def stop
        Net::HTTP.get(@host, "/selenium-server/driver/?cmd=#{shutdown_command}", @port)
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
