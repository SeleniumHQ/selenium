require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha_standalone'

class NotATestUnitAssertionFailedError < StandardError
end

class NotATestUnitTestCase
  
  include Mocha::Standalone
  
  attr_reader :assertion_count
  
  def initialize
    @assertion_count = 0
  end
  
  def run(test_method)
    mocha_setup
    begin
      prepare
      begin
        send(test_method)
        mocha_verify { @assertion_count += 1 }
      rescue Mocha::ExpectationError => e
        new_error = NotATestUnitAssertionFailedError.new(e.message)
        new_error.set_backtrace(e.backtrace)
        raise new_error
      ensure
        cleanup
      end
    ensure
      mocha_teardown
    end
  end
  
  def prepare
  end
  
  def cleanup
  end
    
end

class SampleTest < NotATestUnitTestCase
  
  def mocha_with_fulfilled_expectation
    mockee = mock()
    mockee.expects(:blah)
    mockee.blah
  end
  
  def mocha_with_unfulfilled_expectation
    mockee = mock()
    mockee.expects(:blah)
  end
  
  def mocha_with_unexpected_invocation
    mockee = mock()
    mockee.blah
  end
  
  def stubba_with_fulfilled_expectation
    stubbee = Class.new { define_method(:blah) {} }.new
    stubbee.expects(:blah)
    stubbee.blah
  end
  
  def stubba_with_unfulfilled_expectation
    stubbee = Class.new { define_method(:blah) {} }.new
    stubbee.expects(:blah)
  end
  
  def mocha_with_matching_parameter
    mockee = mock()
    mockee.expects(:blah).with(has_key(:wibble))
    mockee.blah(:wibble => 1)
  end
  
  def mocha_with_non_matching_parameter
    mockee = mock()
    mockee.expects(:blah).with(has_key(:wibble))
    mockee.blah(:wobble => 2)
  end
  
end

require 'test/unit'

class StandaloneAcceptanceTest < Test::Unit::TestCase
  
  attr_reader :sample_test

  def setup
    @sample_test = SampleTest.new
  end
  
  def test_should_pass_mocha_test
    assert_nothing_raised { sample_test.run(:mocha_with_fulfilled_expectation) }
    assert_equal 1, sample_test.assertion_count
  end

  def test_should_fail_mocha_test_due_to_unfulfilled_exception
    assert_raises(NotATestUnitAssertionFailedError) { sample_test.run(:mocha_with_unfulfilled_expectation) }
    assert_equal 1, sample_test.assertion_count
  end

  def test_should_fail_mocha_test_due_to_unexpected_invocation
    assert_raises(NotATestUnitAssertionFailedError) { sample_test.run(:mocha_with_unexpected_invocation) }
    assert_equal 0, sample_test.assertion_count
  end

  def test_should_pass_stubba_test
    assert_nothing_raised { sample_test.run(:stubba_with_fulfilled_expectation) }
    assert_equal 1, sample_test.assertion_count
  end

  def test_should_fail_stubba_test
    assert_raises(NotATestUnitAssertionFailedError) { sample_test.run(:stubba_with_unfulfilled_expectation) }
    assert_equal 1, sample_test.assertion_count
  end

  def test_should_pass_mocha_test_with_matching_parameter
    assert_nothing_raised { sample_test.run(:mocha_with_matching_parameter) }
    assert_equal 1, sample_test.assertion_count
  end

  def test_should_fail_mocha_test_with_non_matching_parameter
    assert_raises(NotATestUnitAssertionFailedError) { sample_test.run(:mocha_with_non_matching_parameter) }
  end

end