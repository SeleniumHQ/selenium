module Selenium
  module Rake

    # Rake task to stop a Selenium Remote Control Server
    #
    # Selenium::Rake::RemoteControlStopTask.new do |rc|
    #   rc.host = "localhost"
    #   rc.port = 4444
    #   rc.timeout_in_seconds = 3 * 60
    # end
    #    
    class SeleniumServerStopTask
      attr_accessor :host, :port, :timeout_in_seconds, :wait_until_stopped,
                    :shutdown_command

      def initialize(name = :'selenium:server:stop')
        @host = "localhost"
        @name = name
        @port = 4444
        @timeout_in_seconds = nil
        @shutdown_command = nil
        @wait_until_stopped = true
        yield self if block_given?
        define
      end
    
      def define
        desc "Stop Selenium server running"
        task @name do
          puts "Stopping Selenium server running at #{host}:#{port}..."
          remote_control = Selenium::ServerControl::ServerControl.new(
              host, port, :timeout => timeout_in_seconds,
              :shutdown_command => shutdown_command)
          remote_control.stop
          if @wait_until_stopped
            TCPSocket.wait_for_service_termination :host => host, :port => port
          end
          puts "Stopped Selenium server stopped"
        end
      end

    end
  end
end
