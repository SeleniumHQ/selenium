module Selenium
  module WebDriver

    #
    # @api private
    #

    module FileReaper

      class << self
        def reap=(bool)
          @reap = bool
        end

        def reap?
          @reap = true unless defined?(@reap)
          !!@reap
        end

        def tmp_files
          @tmp_files ||= Hash.new { |hash, pid| hash[pid] = [] }
          @tmp_files[Process.pid]
        end

        def <<(file)
          tmp_files << file
        end

        def reap(file)
          return unless reap?

          unless tmp_files.include?(file)
            raise Error::WebDriverError, "file not added for reaping: #{file.inspect}"
          end

          FileUtils.rm_rf tmp_files.delete(file)
        end

        def reap!
          if reap?
            tmp_files.each { |file| FileUtils.rm_rf(file) }
            true
          else
            false
          end
        end
      end

      # we *do* want child process reaping, so not using Platform.exit_hook here.
      at_exit { reap! }

    end # FileReaper
  end # WebDriver
end # Selenium