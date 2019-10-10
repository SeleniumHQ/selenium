# frozen_string_literal: true

require 'rbconfig'

module SeleniumRake
  class Checks
    class << self
      # y
      def windows?
        (RbConfig::CONFIG['host_os'] =~ /mswin|msys|mingw32/) != nil
      end

      # y
      def mac?
        (RbConfig::CONFIG['host_os'] =~ /darwin|mac os/) != nil
      end

      def linux?
        (RbConfig::CONFIG['host_os'] =~ /linux/) != nil
      end

      def cygwin?
        RUBY_PLATFORM.downcase.include?('cygwin')
      end

      # y
      def dir_separator
        File::ALT_SEPARATOR || File::SEPARATOR
      end

      def env_separator
        File::PATH_SEPARATOR
      end

      def jruby?
        RUBY_PLATFORM =~ /java/
      end

      # y
      def path_for(path)
        windows? ? path.gsub('/', dir_separator) : path
      end

      def classpath_separator?
        if cygwin?
          ';'
        else
          File::PATH_SEPARATOR
        end
      end

      PRESENT_CACHE = {}.freeze

      # y
      def chrome?
        present?('chromedriver') || present?('chromedriver.exe')
      end

      # y
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

      # y
      def opera?
        present?('opera') || present?('Opera')
      end

      # y
      def python?
        present?('python') || present?('python.exe')
      end

      private

      # y used
      def present?(arg)
        return PRESENT_CACHE[arg] if PRESENT_CACHE.key?(arg)

        bool = prefixes.any? do |prefix|
          File.exist?(prefix + File::SEPARATOR + arg)
        end

        bool = File.exist?("/Applications/#{arg}.app") if !bool && mac?

        PRESENT_CACHE[arg] = bool

        bool
      end

      def prefixes
        ENV['PATH'].split(File::PATH_SEPARATOR)
      end
    end
  end
end
