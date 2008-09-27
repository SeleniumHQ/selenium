module Selenium
  module Rake
  
    class RemoteControlStartTask
      attr_accessor :port, :timeout_in_seconds, :background, 
                    :wait_until_up_and_running, :additional_args
      attr_reader :jar_file

      def initialize(name = :'selenium:rc:start')
        @name = name
        @port = 4444
        @timeout_in_seconds = 5
        @jar_file = "vendor/selenium/selenium-server-1.0-standalone.jar"
        @additional_args = []
        @background = false
        @wait_until_up_and_running = false
        yield self if block_given?
        define
      end
    
      def jar_file=(new_jar_file)
        @jar_file = File.expand_path(new_jar_file)
      end
      
      def define
        desc "Launch Selenium Remote Control"
        task @name do
          puts "Starting Selenium Remote Control at 0.0.0.0:#{@port}..."
          remote_control = Selenium::RemoteControl::RemoteControl.new("0.0.0.0", @port, @timeout_in_seconds)
          remote_control.jar_file = @jar_file
          remote_control.additional_args = @additional_args
          remote_control.start :background => @background
          if @background && @wait_until_up_and_running
            puts "Waiting for Remote Control to be up and running..."
            TCPSocket.wait_for_service :host => @host, :port => @port
          end
          puts "Selenium Remote Control at 0.0.0.0:#{@port} ready"
        end
      end

    end
  end
end
