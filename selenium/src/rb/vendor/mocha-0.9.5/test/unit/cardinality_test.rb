require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha/cardinality'

class CardinalityTest < Test::Unit::TestCase
  
  include Mocha
  
  def test_should_allow_invocations_if_invocation_count_has_not_yet_reached_maximum
    cardinality = Cardinality.new(2, 3)
    assert cardinality.invocations_allowed?(0)
    assert cardinality.invocations_allowed?(1)
    assert cardinality.invocations_allowed?(2)
    assert !cardinality.invocations_allowed?(3)
  end
  
  def test_should_be_satisfied_if_invocations_so_far_have_reached_required_threshold
    cardinality = Cardinality.new(2, 3)
    assert !cardinality.satisfied?(0)
    assert !cardinality.satisfied?(1)
    assert cardinality.satisfied?(2)
    assert cardinality.satisfied?(3)
  end
  
  def test_should_describe_cardinality
    assert_equal 'allowed any number of times', Cardinality.at_least(0).mocha_inspect
    
    assert_equal 'expected at most once', Cardinality.at_most(1).mocha_inspect
    assert_equal 'expected at most twice', Cardinality.at_most(2).mocha_inspect
    assert_equal 'expected at most 3 times', Cardinality.at_most(3).mocha_inspect
    
    assert_equal 'expected at least once', Cardinality.at_least(1).mocha_inspect
    assert_equal 'expected at least twice', Cardinality.at_least(2).mocha_inspect
    assert_equal 'expected at least 3 times', Cardinality.at_least(3).mocha_inspect
    
    assert_equal 'expected never', Cardinality.exactly(0).mocha_inspect
    assert_equal 'expected exactly once', Cardinality.exactly(1).mocha_inspect
    assert_equal 'expected exactly twice', Cardinality.exactly(2).mocha_inspect
    assert_equal 'expected exactly 3 times', Cardinality.times(3).mocha_inspect
    
    assert_equal 'expected between 2 and 4 times', Cardinality.times(2..4).mocha_inspect
    assert_equal 'expected between 1 and 3 times', Cardinality.times(1..3).mocha_inspect
  end
  
  def test_should_need_verifying
    assert Cardinality.exactly(2).needs_verifying?
    assert Cardinality.at_least(3).needs_verifying?
    assert Cardinality.at_most(2).needs_verifying?
    assert Cardinality.times(4).needs_verifying?
    assert Cardinality.times(2..4).needs_verifying?
  end
  
  def test_should_not_need_verifying
    assert_equal false, Cardinality.at_least(0).needs_verifying?
  end
  
end