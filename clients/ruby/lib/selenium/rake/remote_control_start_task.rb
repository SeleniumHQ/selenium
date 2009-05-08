module Selenium
  module Rake
  
    # Rake tasks to start a Remote Control server.
    # 
    # require 'selenium/rake/tasks' 
    # 
    # Selenium::Rake::RemoteControlStartTask.new do |rc|
    #   rc.port = 4444
    #   rc.timeout_in_seconds = 3 * 60
    #   rc.background = true
    #   rc.wait_until_up_and_running = true
    #   rc.jar_file = "/path/to/where/selenium-rc-standalone-jar-is-installed"
    #   rc.additional_args << "-singleWindow"
    # end
    # 
    # If you do not explicitly specify the path to selenium remote control jar
    # it will be "auto-discovered" in `vendor` directory using the following
    # path : `vendor/selenium-remote-control/selenium-server*-standalone.jar`
    # 
    # To leverage all selenium-client capabilities I recommend downloading 
    # a recent nightly build of a standalone packaging of Selenium Remote 
    # Control. You will find the mightly build at 
    # http://archiva.openqa.org/repository/snapshots/org/openqa/selenium/selenium-remote-control/1.0-SNAPSHOT/
    class RemoteControlStartTask
      attr_accessor :port, :timeout_in_seconds, :background, 
                    :wait_until_up_and_running, :additional_args,
                    :log_to
      attr_reader :jar_file

      def initialize(name = :'selenium:rc:start')
        @name = name
        @port = 4444
        @timeout_in_seconds = 5
        project_specific_jar = Dir["vendor/selenium-remote-control/selenium-server*-standalone.jar"].first
        @jar_file = project_specific_jar
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
          remote_control.log_to = @log_to
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
