require 'mocha/inspect'

module Mocha

  class PrettyParameters
  
    def initialize(params)
      @params = params
      @params_string = params.mocha_inspect
    end
  
    def pretty
      remove_outer_array_braces!
      remove_outer_hash_braces!
      @params_string
    end
  
    def remove_outer_array_braces!
      @params_string = @params_string.gsub(/^\[|\]$/, '')
    end
  
    def remove_outer_hash_braces!
      @params_string = @params_string.gsub(/^\{|\}$/, '') if @params.length == 1
    end
  
  end
  
end