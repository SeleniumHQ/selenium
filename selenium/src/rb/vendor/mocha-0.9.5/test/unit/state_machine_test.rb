require File.join(File.dirname(__FILE__), "..", "test_helper")

require 'mocha/state_machine'

class StateMachineTest < Test::Unit::TestCase
  
  include Mocha
  
  def test_should_initially_be_in_no_state
    state_machine = StateMachine.new('name')
    any_state.each do |state|
      assert !state_machine.is(state).active?
      assert state_machine.is_not(state).active?
    end
  end
  
  def test_should_be_able_to_enter_a_state
    state_machine = StateMachine.new('name')
    state = 'A'
    other_states = any_state.reject { |s| s == state }
    
    state_machine.is(state).activate
    
    assert state_machine.is(state).active?
    assert !state_machine.is_not(state).active?
    other_states.each do |s|
      assert !state_machine.is(s).active?
      assert state_machine.is_not(s).active?
    end
  end
  
  def test_should_be_able_to_change_state
    state_machine = StateMachine.new('name')
    state = 'B'
    other_states = any_state.reject { |s| s == state }
    
    state_machine.is('A').activate
    state_machine.is(state).activate
    
    assert state_machine.is(state).active?
    assert !state_machine.is_not(state).active?
    other_states.each do |s|
      assert !state_machine.is(s).active?
      assert state_machine.is_not(s).active?
    end
  end
  
  def test_should_be_put_into_an_initial_state
    state_machine = StateMachine.new('name')
    initial_state = 'A'
    other_states = any_state.reject { |s| s == initial_state }
    
    state_machine.starts_as(initial_state)
    
    assert state_machine.is(initial_state).active?
    assert !state_machine.is_not(initial_state).active?
    other_states.each do |state|
      assert !state_machine.is(state).active?
      assert state_machine.is_not(state).active?
    end
  end
  
  def test_should_be_put_into_a_new_state
    next_state = 'B'
    
    other_states = any_state.reject { |s| s == next_state }
    state_machine = StateMachine.new('name').starts_as('A')
    
    state_machine.become(next_state)
    
    assert state_machine.is(next_state).active?
    assert !state_machine.is_not(next_state).active?
    other_states.each do |state|
      assert !state_machine.is(state).active?
      assert state_machine.is_not(state).active?
    end
  end
  
  def test_should_describe_itself_as_name_and_current_state
    state_machine = StateMachine.new('state_machine_name')
    assert_equal 'state_machine_name has no current state', state_machine.mocha_inspect
    inspectable_state = Class.new { define_method(:mocha_inspect) { "'inspectable_state'" } }.new
    state_machine.is(inspectable_state).activate
    assert_equal "state_machine_name is 'inspectable_state'", state_machine.mocha_inspect
  end
  
  def test_should_have_self_describing_states
    state_machine = StateMachine.new('state_machine_name')
    inspectable_state = Class.new { define_method(:mocha_inspect) { "'inspectable_state'" } }.new
    assert_equal "state_machine_name is 'inspectable_state'", state_machine.is(inspectable_state).mocha_inspect
    assert_equal "state_machine_name is not 'inspectable_state'", state_machine.is_not(inspectable_state).mocha_inspect
  end
  
  def any_state
    %w(A B C D)
  end
  
end
