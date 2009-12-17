module Selenium
  module WebDriver

    #
    # Cross platform child process launcher
    #

    class ChildProcess
      attr_reader :pid

      def initialize(*args)
        @args = args

        if Platform.jruby?
          extend JRubyProcess
        elsif Platform.os == :windows
          extend WindowsProcess
        end
      end

      def ugly_death?
        code = exit_value()
        # if exit_val is nil, the process is still alive
        code && code != 0
      end

      def exit_value
        pid, status = Process.waitpid2(@pid, Process::WNOHANG)
        status.exitstatus if pid
      end

      def start
        @pid = fork do
          unless $DEBUG
            [STDOUT, STDERR].each { |io| io.reopen("/dev/null") }
          end

          exec(*@args)
        end

        self
      end

      def wait
        raise "called wait with no pid" unless @pid
        Process.waitpid2 @pid
      rescue Errno::ECHILD
        nil
      end

      def kill
        Process.kill('TERM', @pid) if @pid
      end

      def kill!
        Process.kill('KILL', @pid) if @pid
      end

      module WindowsProcess
        def start
          require "win32/process" # adds a dependency on windows
          @pid = Process.create(
            :app_name        => @args.join(" "),
            :process_inherit => true,
            :thread_inherit  => true,
            :inherit         => true
          ).process_id

          self
        end

        def kill
          kill!
        end
      end

      module JRubyProcess
        def start
          pb = java.lang.ProcessBuilder.new(@args)

          # this isn't good
          env = pb.environment
          ENV.each { |k,v| env.put(k, v) }

          @process = pb.start

          self
        end

        def kill
          @process.destroy if @process
        end
        alias_method :kill!, :kill

        def wait
          @process.waitFor
        end

        def exit_value
          @process.exitValue
        rescue java.lang.IllegalThreadStateException
          nil
        end
      end

    end # ChildProcess
  end # WebDriver
end # Selenium