module Selenium
  module WebDriver
    module JsonHelper

      # ActiveSupport may define Object#load, so we can't use MultiJson.respond_to? here
      sm = MultiJson.singleton_methods.map { |e| e.to_sym }

      if sm.include? :load
        # @api private
        def json_load(obj)
          MultiJson.load(obj)
        end
      else
        # @api private
        def json_load(obj)
          MultiJson.decode(obj)
        end
      end

      if sm.include? :dump
        # @api private
        def json_dump(obj)
          MultiJson.dump(obj)
        end
      else
        # @api private
        def json_dump(obj)
          MultiJson.encode(obj)
        end
      end

    end
  end
end