module Selenium
  module WebDriver
    class Logs

      #
      # @api private
      #

      def initialize(bridge)
        @bridge = bridge
      end

      def get(type)
        @bridge.getLog type
      end

      def available_types
        @bridge.getAvailableLogTypes
      end

    end
  end
end