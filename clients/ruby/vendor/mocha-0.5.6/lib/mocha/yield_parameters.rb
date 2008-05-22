require 'mocha/no_yields'
require 'mocha/single_yield'
require 'mocha/multiple_yields'

module Mocha # :nodoc:
  
  class YieldParameters # :nodoc:
    
    def initialize
      @parameter_groups = []
    end
    
    def next_invocation
      case @parameter_groups.length
      when 0; NoYields.new
      when 1; @parameter_groups.first
      else @parameter_groups.shift
      end
    end
    
    def add(*parameters)
      @parameter_groups << SingleYield.new(*parameters)
    end
    
    def multiple_add(*parameter_groups)
      @parameter_groups << MultipleYields.new(*parameter_groups)
    end
    
  end
  
end