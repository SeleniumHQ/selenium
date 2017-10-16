module Selenium
  module WebDriver
    module Servo
      #
      # @api private
      #

      class Service < WebDriver::Service
        DEFAULT_PORT = 7000
        @executable = 'servo'.freeze
        @missing_text = <<-ERROR.gsub(/\n +| {2,}/, ' ').freeze
          Unable to find servo. Please download the server from
          https://download.servo.org/ and place it somewhere on your PATH.
        ERROR

        private

        def start_process
          @process = build_process(@executable_path, "--webdriver=#{@port}", *@extra_args)
          @process.leader = true unless Platform.windows?
          @process.start
        end

        def cannot_connect_error_text
          "unable to connect to servo #{@host}:#{@port}"
        end
      end # Service
    end # Servo
  end # WebDriver
end # Selenium
