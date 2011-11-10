module Selenium
  module WebDriver
    
    #
    # @api beta This API may be changed or removed in a future release.
    # 
    
    class Window

      def initialize(bridge)
        @bridge = bridge
      end

      def size=(dimension)
        unless dimension.respond_to?(:width) && dimension.respond_to?(:height)
          raise ArgumentError, "expected #{dimension.inspect}:#{dimension.class}" +
                                " to respond to #width and #height"
        end

        @bridge.setWindowSize dimension.width, dimension.height
      end

      def size
        @bridge.getWindowSize
      end

      def position=(point)
        unless point.respond_to?(:x) && point.respond_to?(:y)
          raise ArgumentError, "expected #{point.inspect}:#{point.class}" +
                                " to respond to #x and #y"
        end

        @bridge.setWindowPosition point.x, point.y
      end

      def position
        @bridge.getWindowPosition
      end

      #
      # equivalent to #size=, but accepts width and height arguments
      #

      def resize_to(width, height)
        @bridge.setWindowSize Integer(width), Integer(height)
      end

      #
      # equivalent to #position=, but accepts x and y arguments
      #

      def move_to(x, y)
        @bridge.setWindowPosition Integer(x), Integer(y)
      end


    end
  end
end