module Mocha
  
  class ArgumentIterator
  
    def initialize(argument)
      @argument = argument
    end
  
    def each(&block)
      if @argument.is_a?(Hash) then
        @argument.each do |method_name, return_value|
          block.call(method_name, return_value)
        end
      else
        block.call(@argument)
      end
    end
  
  end
  
end