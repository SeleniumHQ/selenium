require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha/sequence'
require 'mocha/expectation'

class SequenceTest < Test::Unit::TestCase
  
  include Mocha
  
  class FakeExpectation
    
    attr_reader :ordering_constraints
    
    def initialize(satisfied = false)
      @satisfied = satisfied
      @ordering_constraints = []
    end
    
    def add_ordering_constraint(ordering_constraint)
      @ordering_constraints << ordering_constraint
    end
    
    def satisfied?
      @satisfied
    end
    
  end
  
  def test_should_be_satisfied_if_no_expectations_added
    sequence = Sequence.new('name')
    assert sequence.satisfied_to_index?(0)
  end

  def test_should_be_satisfied_if_one_unsatisfied_expectations_added_but_it_is_not_included_by_index
    sequence = Sequence.new('name')
    expectation = FakeExpectation.new(satisfied = false)
    sequence.constrain_as_next_in_sequence(expectation)
    assert sequence.satisfied_to_index?(0)
  end

  def test_should_not_be_satisfied_if_one_unsatisfied_expectations_added_and_it_is_included_by_index
    sequence = Sequence.new('name')
    expectation = FakeExpectation.new(satisfied = false)
    sequence.constrain_as_next_in_sequence(expectation)
    assert !sequence.satisfied_to_index?(1)
  end

  def test_should_be_satisfied_if_one_satisfied_expectations_added_and_it_is_included_by_index
    sequence = Sequence.new('name')
    expectation = FakeExpectation.new(satisfied = true)
    sequence.constrain_as_next_in_sequence(expectation)
    assert sequence.satisfied_to_index?(1)
  end

  def test_should_not_be_satisfied_if_one_satisfied_and_one_unsatisfied_expectation_added_and_both_are_included_by_index
    sequence = Sequence.new('name')
    expectation_one = FakeExpectation.new(satisfied = true)
    expectation_two = FakeExpectation.new(satisfied = false)
    sequence.constrain_as_next_in_sequence(expectation_one)
    sequence.constrain_as_next_in_sequence(expectation_two)
    assert !sequence.satisfied_to_index?(2)
  end

  def test_should_be_satisfied_if_two_satisfied_expectations_added_and_both_are_included_by_index
    sequence = Sequence.new('name')
    expectation_one = FakeExpectation.new(satisfied = true)
    expectation_two = FakeExpectation.new(satisfied = true)
    sequence.constrain_as_next_in_sequence(expectation_one)
    sequence.constrain_as_next_in_sequence(expectation_two)
    assert sequence.satisfied_to_index?(2)
  end
  
  def test_should_add_ordering_constraint_to_expectation
    sequence = Sequence.new('name')
    expectation = FakeExpectation.new
    sequence.constrain_as_next_in_sequence(expectation)
    assert_equal 1, expectation.ordering_constraints.length
  end

  def test_should_not_allow_invocation_of_second_method_when_first_n_sequence_has_not_been_invoked
    sequence = Sequence.new('name')
    expectation_one = FakeExpectation.new(satisfied = false)
    expectation_two = FakeExpectation.new(satisfied = false)
    sequence.constrain_as_next_in_sequence(expectation_one)
    sequence.constrain_as_next_in_sequence(expectation_two)
    assert !expectation_two.ordering_constraints[0].allows_invocation_now?
  end

  def test_should_allow_invocation_of_second_method_when_first_in_sequence_has_been_invoked
    sequence = Sequence.new('name')
    expectation_one = FakeExpectation.new(satisfied = true)
    expectation_two = FakeExpectation.new(satisfied = false)
    sequence.constrain_as_next_in_sequence(expectation_one)
    sequence.constrain_as_next_in_sequence(expectation_two)
    assert expectation_two.ordering_constraints[0].allows_invocation_now?
  end

  def test_should_describe_ordering_constraint_as_being_part_of_named_sequence
    sequence = Sequence.new('wibble')
    expectation = FakeExpectation.new
    sequence.constrain_as_next_in_sequence(expectation)
    assert_equal "in sequence 'wibble'", expectation.ordering_constraints[0].mocha_inspect
  end

end