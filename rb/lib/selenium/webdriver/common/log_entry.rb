module Selenium
  module WebDriver
    class LogEntry
      attr_reader :level, :timestamp, :message

      def initialize(level, timestamp, message)
        @level      = level
        @timestamp = timestamp
        @message    = message
      end

      def as_json(opts = nil)
        {
          'level'     => level,
          'timestamp' => timestamp,
          'message'   => message
        }
      end

      def to_s
        "#{level} #{time}: #{message}"
      end

      def time
        Time.at timestamp / 1000
      end
    end
  end
end