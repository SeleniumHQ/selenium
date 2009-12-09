module Selenium
  module RemoteControl
    
    class RemoteControl
      attr_reader :host, :port, :timeout_in_seconds, :shutdown_command
      attr_accessor :additional_args, :jar_file, :log_to
      
      def initialize(host, port, options={})
        @host, @port = host, port
        @timeout_in_seconds = options[:timeout] || (2 * 60)
        @shutdown_command = options[:shutdown_command] || "shutDownSeleniumServer"
        @additional_args = []
        @shell = Nautilus::Shell.new
      end
      
      def start(options = {})
        command = "java -jar \"#{jar_file}\""
        command << " -port #{@port}"
        command << " -timeout #{@timeout_in_seconds}"
        command << " #{additional_args.join(' ')}" unless additional_args.empty?
        command << " > #{log_to}" if log_to
        
        @shell.run command, {:background => options[:background]}
      end
      
      def stop
        Net::HTTP.get(@host, "/selenium-server/driver/?cmd=#{shutdown_command}", @port)
      end
      
    end
    
  end
end
