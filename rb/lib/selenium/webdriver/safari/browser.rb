module Selenium
  module WebDriver
    module Safari

      class Browser
        def start(*args)
          @process = ChildProcess.new(executable_path, *args)
          @process.io.inherit! if $DEBUG
          @process.start
        end

        def stop
          @process.stop if @process
        end

        private

        def executable_path
          # TODO: Windows
          "/Applications/Safari.app/Contents/MacOS/Safari"
        end
      end

    end
  end
end