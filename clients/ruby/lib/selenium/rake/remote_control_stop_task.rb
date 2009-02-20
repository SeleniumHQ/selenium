module Selenium
  module Rake

    class RemoteControlStopTask
      attr_accessor :host, :port, :timeout_in_seconds, :wait_until_stopped

      def initialize(name = :'selenium:rc:stop')
        @host = "localhost"
        @name = name
        @port = 4444
        @timeout_in_seconds = 5
        @wait_until_stopped = true
        yield self if block_given?
        define
      end
    
      def define
        desc "Stop Selenium Remote Control running"
        task @name do
          puts "Stopping Selenium Remote Control running at #{@host}:#{@port}..."
          remote_control = Selenium::RemoteControl::RemoteControl.new(@host, @port, @timeout_in_seconds)
          remote_control.stop
          if @wait_until_stopped
            TCPSocket.wait_for_service_termination :host => @host, :port => @port
          end
          puts "Stopped Selenium Remote Control running at #{@host}:#{@port}"
        end
      end

    end
  end
end
