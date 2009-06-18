require 'mocha/backtrace_filter'

module Mocha # :nodoc:
  
  # Exception raised when an action prevented by Configuration#prevent is attempted.
  class StubbingError < StandardError

    def initialize(message = nil, backtrace = []) # :nodoc:
      super(message)
      filter = BacktraceFilter.new
      set_backtrace(filter.filtered(backtrace))
    end

  end
  
end
