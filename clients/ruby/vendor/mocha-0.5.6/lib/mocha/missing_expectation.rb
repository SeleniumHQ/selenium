require 'mocha/expectation'

module Mocha # :nodoc:
  
  class MissingExpectation < Expectation # :nodoc:

    def verify
      message = error_message(0, 1)
      similar_expectations = @mock.expectations.similar(@method_matcher.expected_method_name)
      method_signatures = similar_expectations.map { |expectation| expectation.method_signature }
      message << "\nSimilar expectations:\n#{method_signatures.join("\n")}" unless method_signatures.empty?
      raise ExpectationError.new(message, backtrace)
    end

  end

end