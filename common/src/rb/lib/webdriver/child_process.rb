module WebDriver

  #
  # Cross platform child process launcher
  #

  class ChildProcess
    def initialize(*args)
      @args = args

      if Platform.jruby?
        extend JRubyProcess
      elsif Platform.os == :windows
        extend WindowsProcess
      end
    end

    def alive?
      return false unless @pid

      # TODO: check if this works on windows
      Process.kill 0, @pid
      true
    rescue Errno::ESRCH
      false
    end

    def start
      @pid = fork { exec(*@args) }

      self
    end

    def wait
      raise "called wait with no pid" unless @pid
      Process.waitpid @pid
    end

    def kill
      Process.kill("TERM", @pid) if @pid
    end

    def kill!
      Process.kill("KILL", @pid) if @pid
    end

    module WindowsProcess
      def start
        require "win32/process" # adds a dependency on windows
        @pid = Process.create(:app_name        => @args.join(" "),
                              :process_inherit => true,
                              :thread_inherit  => true,
                              :inherit         => true).process_id

        self
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
    end

  end # ChildProcess
end # WebDriver