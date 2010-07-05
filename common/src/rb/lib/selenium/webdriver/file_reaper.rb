module Selenium
  module WebDriver
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
          @tmp_files ||= []
        end

        def <<(file)
          tmp_files << file
        end

        def reap!
          tmp_files.each { |file| FileUtils.rm_rf(file) } if reap?
        end
      end

      at_exit { reap! }

    end # FileReaper
  end # WebDriver
end # Selenium