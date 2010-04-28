module Selenium
  module WebDriver
    class Options

      #
      # @private
      #

      def initialize(driver)
        @bridge = driver.bridge
      end

      #
      # Add a cookie to the browser
      #
      # @param [Hash] opts the options to create a cookie with.
      # @option opts [String] :name A name
      # @option opts [String] :value A value
      # @option opts [String] :path ('/') A path
      # @option opts [String] :secure (false) A boolean
      #
      # @raise [ArgumentError] if :name or :value is not specified
      #

      def add_cookie(opts = {})
        raise ArgumentError, "name is required" unless opts[:name]
        raise ArgumentError, "value is required" unless opts[:value]

        opts[:path] ||= "/"
        opts[:secure] ||= false

        @bridge.addCookie opts
      end

      #
      # Delete the cookie with the given name
      #
      # @param [String] name the name of the cookie to delete
      #

      def delete_cookie(name)
        @bridge.deleteCookie name
      end

      #
      # Delete all cookies
      #

      def delete_all_cookies
        @bridge.deleteAllCookies
      end

      #
      # Get all cookies
      #
      # @return [Array<Hash>] list of cookies
      #

      def all_cookies
        @bridge.getAllCookies.map do |cookie|
          {
            :name    => cookie["name"],
            :value   => cookie["value"],
            :path    => cookie["path"],
            :domain  => cookie["domain"],
            :expires => cookie["expires"],
            :secure  => cookie["secure"]
          }
        end
      end

      def speed
        @bridge.getSpeed.downcase.to_sym
      end

      def speed=(speed)
        @bridge.setSpeed(speed.to_s.upcase)
      end

      def timeouts
        @timeouts ||= Timeouts.new(@bridge)
      end

    end # Options
  end # WebDriver
end # Selenium