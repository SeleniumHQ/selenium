require 'mocha/backtrace_filter'

module Mocha

  class ExpectationError < StandardError
    
    def initialize(message = nil, backtrace = [])
      super(message)
      filter = BacktraceFilter.new
      set_backtrace(filter.filtered(backtrace))
    end

  end
  
end
