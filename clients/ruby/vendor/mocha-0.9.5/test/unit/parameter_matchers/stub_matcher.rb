module Stub
  
  class Matcher

    attr_accessor :value

    def initialize(matches)
      @matches = matches
    end

    def matches?(available_parameters)
      value = available_parameters.shift
      @value = value
      @matches
    end

    def mocha_inspect
      "matcher(#{@matches})"
    end
    
    def to_matcher
      self
    end

  end
  
end