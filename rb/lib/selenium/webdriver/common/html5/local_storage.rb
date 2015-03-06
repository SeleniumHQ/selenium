module Selenium
  module WebDriver
    module HTML5

      class LocalStorage
        include SharedWebStorage

        #
        # @api private
        #
        def initialize(bridge)
          @bridge = bridge
        end

        def [](key)
          @bridge.getLocalStorageItem key
        end

        def []=(key, value)
          @bridge.setLocalStorageItem key, value
        end

        def delete(key)
          @bridge.removeLocalStorageItem key
        end

        def clear
          @bridge.clearLocalStorage
        end

        def size
          @bridge.getLocalStorageSize
        end

        def keys
          @bridge.getLocalStorageKeys.reverse
        end
      end

    end
  end
end