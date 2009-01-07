require 'mocha/parameter_matchers/equals'

module Mocha
  
  module ObjectMethods
    def to_matcher # :nodoc:
      Mocha::ParameterMatchers::Equals.new(self)
    end
  end
  
end

class Object
  include Mocha::ObjectMethods
end
