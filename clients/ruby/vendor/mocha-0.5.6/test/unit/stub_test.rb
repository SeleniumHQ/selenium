require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha/stub'

class StubTest < Test::Unit::TestCase
  
  include Mocha
  
  def test_should_always_verify_successfully
    stub = Stub.new(nil, :expected_method)
    assert stub.verify
    stub.invoke
    assert stub.verify
  end
  
  def test_should_match_successfully_for_any_number_of_invocations
    stub = Stub.new(nil, :expected_method)
    assert stub.match?(:expected_method)
    stub.invoke
    assert stub.match?(:expected_method)
    stub.invoke
    assert stub.match?(:expected_method)
  end
  
end