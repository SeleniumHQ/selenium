# frozen_string_literal: true

require 'rbconfig'

module SeleniumRake
  class Checks
    class << self
      PRESENT_CACHE = {}.freeze

      def windows?
        (RbConfig::CONFIG['host_os'] =~ /mswin|msys|mingw32/) != nil
      end

      def mac?
        (RbConfig::CONFIG['host_os'] =~ /darwin|mac os/) != nil
      end

      def dir_separator
        File::ALT_SEPARATOR || File::SEPARATOR
      end

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

      def chrome?
        present?('chromedriver') || present?('chromedriver.exe')
      end

      def edge?
        present?('msedgedriver') || present?('msedgedriver.exe')
      end

      def opera?
        present?('opera') || present?('Opera')
      end

      def python?
        present?('python') || present?('python.exe')
      end

      private

      def cygwin?
        RUBY_PLATFORM.downcase.include?('cygwin')
      end

      def present?(arg)
        return PRESENT_CACHE[arg] if PRESENT_CACHE.key?(arg)

        bool = prefixes.any? do |prefix|
          File.exist?("#{prefix}#{File::SEPARATOR}#{arg}")
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
