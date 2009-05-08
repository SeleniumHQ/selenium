module Selenium
  module RemoteControl
    
    class RemoteControl
      attr_reader :host, :port, :timeout_in_seconds
      attr_accessor :additional_args, :jar_file, :log_to
      
      def initialize(host, port, timeout_in_seconds = 2 * 60)
        @host, @port, @timeout_in_seconds = host, port, timeout_in_seconds
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
        Net::HTTP.get(@host, '/selenium-server/driver/?cmd=shutDown', @port)
      end
      
    end
    
  end
end
