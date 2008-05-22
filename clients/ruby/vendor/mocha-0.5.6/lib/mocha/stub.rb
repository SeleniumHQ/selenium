require 'mocha/expectation'

module Mocha # :nodoc:

  class Stub < Expectation # :nodoc:

    def initialize(mock, method_name, backtrace = nil)
      super
      @expected_count = Range.at_least(0)
    end
    
    def verify
      true
    end

  end

end