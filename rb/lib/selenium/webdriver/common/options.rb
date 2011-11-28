module Selenium
  module WebDriver
    class Options

      #
      # @api private
      #

      def initialize(bridge)
        @bridge = bridge
      end

      #
      # Add a cookie to the browser
      #
      # @param [Hash] opts the options to create a cookie with.
      # @option opts [String] :name A name
      # @option opts [String] :value A value
      # @option opts [String] :path ('/') A path
      # @option opts [String] :secure (false) A boolean
      # @option opts [Time,DateTime,Numeric,nil] :expires (nil) Expiry date, either as a Time, DateTime, or seconds since epoch.
      #
      # @raise [ArgumentError] if :name or :value is not specified
      #

      def add_cookie(opts = {})
        raise ArgumentError, "name is required" unless opts[:name]
        raise ArgumentError, "value is required" unless opts[:value]

        opts[:path] ||= "/"
        opts[:secure] ||= false

        if obj = opts.delete(:expires)
          opts[:expiry] = seconds_from(obj)
        end


        @bridge.addCookie opts
      end

      #
      # Get the cookie with the given name
      #
      # @param [String] name the name of the cookie
      # @return [Hash, nil] the cookie, or nil if it wasn't found.
      #

      def cookie_named(name)
        all_cookies.find { |c| c[:name] == name }
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
            :domain  => cookie["domain"] && strip_port(cookie["domain"]),
            :expires => cookie["expiry"] && datetime_at(cookie['expiry']),
            :secure  => cookie["secure"]
          }
        end
      end

      def timeouts
        @timeouts ||= Timeouts.new(@bridge)
      end

      #
      # @api beta This API may be changed or removed in a future release.
      #

      def window
        @window ||= Window.new(@bridge)
      end

      private

      SECONDS_PER_DAY = 86_400.0

      def datetime_at(int)
        DateTime.civil(1970) + (int / SECONDS_PER_DAY)
      end

      def seconds_from(obj)
        case obj
        when Time
          obj.to_f
        when DateTime
          (obj - DateTime.civil(1970)) * SECONDS_PER_DAY
        when Numeric
          obj
        else
          raise ArgumentError, "invalid value for expiration date: #{obj.inspect}"
        end
      end

      def strip_port(str)
        str.split(":", 2).first
      end

    end # Options
  end # WebDriver
end # Selenium
