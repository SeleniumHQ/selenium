# Defines a mixin module that you can use to write Selenium tests
# without typing "@selenium." in front of every command.  Every
# call to a missing method will be automatically sent to the @selenium
# object.
module Selenium
  module Client
    
  module SeleniumHelper
    
      # Overrides standard "open" method with @selenium.open
      def open(addr)
        @selenium.open(addr)
      end
    
      # Overrides standard "type" method with @selenium.type
      def type(inputLocator, value)
        @selenium.type(inputLocator, value)
      end
    
      # Overrides standard "select" method with @selenium.select
      def select(inputLocator, optionLocator)
        @selenium.select(inputLocator, optionLocator)
      end

      # Passes all calls to missing methods to @selenium
      def method_missing(method_name, *args)
        if args.empty?
            @selenium.send(method_name)
        else
            @selenium.send(method_name, *args)
        end
      end      
    end
    
  end
end