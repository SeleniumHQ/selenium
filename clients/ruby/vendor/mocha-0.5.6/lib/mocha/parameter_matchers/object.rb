require 'mocha/parameter_matchers/equals'

class Object
  
  def to_matcher
    Mocha::ParameterMatchers::Equals.new(self)
  end
  
end
