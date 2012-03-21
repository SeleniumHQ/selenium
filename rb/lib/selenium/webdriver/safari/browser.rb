module Selenium
  module WebDriver
    module Safari

      class Browser
        def start(*args)
          @process = ChildProcess.new(Safari.path, *args)
          @process.io.inherit! if $DEBUG
          @process.start
        end

        def stop
          @process.stop if @process
        end

      end

    end
  end
end