require 'rbconfig'

# Platform checks
# Moved from checks.rb
module SeleniumRake
  class Checks
    class << self
      def windows?
        (RbConfig::CONFIG['host_os'] =~ /mswin|msys|mingw32/) != nil
      end

      def mac?
        (RbConfig::CONFIG['host_os'] =~ /darwin|mac os/) != nil
      end

      def linux?
        (RbConfig::CONFIG['host_os'] =~ /linux/) != nil
      end

      def cygwin?
        RUBY_PLATFORM.downcase.include?('cygwin')
      end

      def classpath_separator?
        if cygwin?
          ';'
        else
          File::PATH_SEPARATOR
        end
      end

      PRESENT_CACHE = {}

      # Checking for particular applications
      # This "I believe" can be made private - Luke - Sep 2019
      def present?(arg)
        return PRESENT_CACHE[arg] if PRESENT_CACHE.key?(arg)

        prefixes = ENV['PATH'].split(File::PATH_SEPARATOR)

        bool = prefixes.any? do |prefix|
          File.exist?(prefix + File::SEPARATOR + arg)
        end

        bool = File.exist?("/Applications/#{arg}.app") if !bool && mac?

        PRESENT_CACHE[arg] = bool

        bool
      end

      def chrome?
        present?('chromedriver') || present?('chromedriver.exe')
      end

      def edge?
        present?('msedgedriver') || present?('msedgedriver.exe')
      end

      # Think of the confusion if we called this "g++"
      def gcc?
        linux? && present?('g++')
      end

      def msbuild_installed?
        windows? && present?('msbuild.exe')
      end

      def opera?
        present?('opera') || present?('Opera')
      end

      def python?
        present?('python') || present?('python.exe')
      end
    end
  end
end
