module Mocha
  
  # Used as parameters for Expectation#with to restrict the parameter values which will match the expectation. Can be nested.
  module ParameterMatchers; end
  
end

require 'mocha/parameter_matchers/object'

require 'mocha/parameter_matchers/all_of'
require 'mocha/parameter_matchers/any_of'
require 'mocha/parameter_matchers/any_parameters'
require 'mocha/parameter_matchers/anything'
require 'mocha/parameter_matchers/equals'
require 'mocha/parameter_matchers/has_entry'
require 'mocha/parameter_matchers/has_entries'
require 'mocha/parameter_matchers/has_key'
require 'mocha/parameter_matchers/has_value'
require 'mocha/parameter_matchers/includes'
require 'mocha/parameter_matchers/instance_of'
require 'mocha/parameter_matchers/is_a'
require 'mocha/parameter_matchers/kind_of'
require 'mocha/parameter_matchers/not'
require 'mocha/parameter_matchers/optionally'
require 'mocha/parameter_matchers/regexp_matches'
require 'mocha/parameter_matchers/responds_with'
require 'mocha/parameter_matchers/yaml_equivalent'
