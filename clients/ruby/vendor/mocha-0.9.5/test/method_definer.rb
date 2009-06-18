require 'mocha/metaclass'

module Mocha
  
  module ObjectMethods
    def define_instance_method(method_symbol, &block)
      __metaclass__.send(:define_method, method_symbol, block)
    end

    def replace_instance_method(method_symbol, &block)
      raise "Cannot replace #{method_symbol} as #{self} does not respond to it." unless self.respond_to?(method_symbol)
      define_instance_method(method_symbol, &block)
    end

    def define_instance_accessor(*symbols)
      symbols.each { |symbol| __metaclass__.send(:attr_accessor, symbol) }
    end
  end
  
end

class Object
  include Mocha::ObjectMethods
end