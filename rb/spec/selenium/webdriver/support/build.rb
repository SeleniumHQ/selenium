module Selenium
  module WebDriver
    module SpecSupport

      #
      # Wrap the go script
      #

      class Build

        def initialize(targets)
          @targets = [go_command, *targets]
          @process = nil
        end

        def go
          Dir.chdir(root) {
            @process = ChildProcess.new(*@targets).start
          }
        end

        def kill
          return unless @process && @process.started?
          @process.kill
          @process.ensure_death
        end

        private

        def go_command
          Platform.win? ? "go.bat" : "./go"
        end

        def root
          File.expand_path("../../../../../../", __FILE__)
        end

      end

    end # SpecSupport
  end # WebDriver
end # Selenium