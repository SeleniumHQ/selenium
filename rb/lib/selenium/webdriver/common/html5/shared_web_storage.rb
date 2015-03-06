module Selenium
  module WebDriver
    module HTML5

      module SharedWebStorage
        include Enumerable

        def key?(key)
          keys.include? key
        end
        alias_method :member?, :key?
        alias_method :has_key?, :key?

        def fetch(key, &blk)
          if self.key? key
            return self[key]
          end

          if block_given?
            yield key
          else
            # should be KeyError, but it's 1.9-specific
            raise IndexError, "missing key #{key.inspect}" 
          end
        end

        def empty?
          size == 0
        end

        def each(&blk)
          return enum_for(:each) unless block_given?

          keys.each do |k|
            yield k, self[k]
          end
        end
      end

    end
  end
end