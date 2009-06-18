# Defines a mixin module that you can use to write Selenium tests
# without typing "@selenium." in front of every command.  Every
# call to a missing method will be automatically sent to the @selenium
# object.
module Selenium
  module Client
    
    module SeleniumHelper
    
      # Overrides default open method to actually delegates to @selenium
      def open(url)
        @selenium.open url
      end
    
      # Overrides default type method to actually delegates to @selenium
      def type(locator, value)
        @selenium.type locator, value
      end
    
      # Overrides default select method to actually delegates to @selenium
      def select(input_locator, option_locator)
        @selenium.select input_locator, option_locator
      end

      # Delegates to @selenium on method missing 
      def method_missing(method_name, *args)
        return super unless @selenium.respond_to?(method_name)
        
        @selenium.send(method_name, *args)
      end                  
    end
    
  end
end