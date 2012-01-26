module Selenium
  module WebDriver
    module HTML5

      class SessionStorage
        include Enumerable
        include SharedWebStorage

        def [](key)
          @bridge.getSessionStorageItem key
        end

        def []=(key, value)
          @bridge.setSessionStorageItem key, value
        end

        def delete(key)
          @bridge.removeSessionStorageItem key
        end

        def clear
          @bridge.clearSessionStorage
        end

        def size
          @bridge.getSessionStorageSize
        end

        def keys
          @bridge.getSessionStorageKeys.reverse
        end

        #
        # @api private
        #

        def initialize(bridge)
          @bridge = bridge
        end
      end

    end
  end
end
