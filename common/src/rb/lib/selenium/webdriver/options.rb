module Selenium
  module WebDriver
    class Options

      def initialize(driver)
        @bridge = driver.bridge
      end

      def add_cookie(opts = {})
        raise ArgumentError, "name is required" unless opts[:name]
        raise ArgumentError, "value is required" unless opts[:value]

        opts[:path] ||= "/"
        opts[:secure] ||= false

        @bridge.addCookie opts
      end

      def delete_cookie(name)
        @bridge.deleteCookie name
      end

      def delete_all_cookies
        @bridge.deleteAllCookies
      end

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

    end # Options
  end # WebDriver
end # Selenium