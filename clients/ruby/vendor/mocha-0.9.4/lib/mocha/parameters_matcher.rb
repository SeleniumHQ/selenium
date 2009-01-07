require 'mocha/inspect'
require 'mocha/parameter_matchers'

module Mocha
  
  class ParametersMatcher
    
    def initialize(expected_parameters = [ParameterMatchers::AnyParameters.new], &matching_block)
      @expected_parameters, @matching_block = expected_parameters, matching_block
    end
    
    def match?(actual_parameters = [])
      if @matching_block
        return @matching_block.call(*actual_parameters)
      else
        return parameters_match?(actual_parameters)
      end
    end
    
    def parameters_match?(actual_parameters)
      matchers.all? { |matcher| matcher.matches?(actual_parameters) } && (actual_parameters.length == 0)
    end
    
    def mocha_inspect
      signature = matchers.mocha_inspect
      signature = signature.gsub(/^\[|\]$/, '')
      signature = signature.gsub(/^\{|\}$/, '') if matchers.length == 1
      "(#{signature})"
    end
    
    def matchers
      @expected_parameters.map { |parameter| parameter.to_matcher }
    end
    
  end

end