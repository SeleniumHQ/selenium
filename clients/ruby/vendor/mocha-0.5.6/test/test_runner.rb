require 'test/unit/testresult'
require 'test/unit/testcase'
require 'mocha/standalone'
require 'mocha/test_case_adapter'

module TestRunner
  
  def run_test(test_result = Test::Unit::TestResult.new, &block)
    test_class = Class.new(Test::Unit::TestCase) do
      include Mocha::Standalone
      include Mocha::TestCaseAdapter
      define_method(:test_me, &block)
    end
    test = test_class.new(:test_me)
    test.run(test_result) {}
    class << test_result
      attr_reader :failures, :errors
    end
    test_result
  end
  
  def assert_passed(test_result)
    flunk "Test failed unexpectedly with message: #{test_result.failures}" if test_result.failure_count > 0
    flunk "Test failed unexpectedly with message: #{test_result.errors}" if test_result.error_count > 0
  end

  def assert_failed(test_result)
    flunk "Test passed unexpectedly" if test_result.passed?
  end

end