require 'mocha/method_matcher'
require 'mocha/parameters_matcher'
require 'mocha/expectation_error'
require 'mocha/return_values'
require 'mocha/exception_raiser'
require 'mocha/yield_parameters'
require 'mocha/is_a'
require 'mocha/in_state_ordering_constraint'
require 'mocha/change_state_side_effect'
require 'mocha/cardinality'

module Mocha # :nodoc:
  
  # Methods on expectations returned from Mock#expects, Mock#stubs, Object#expects and Object#stubs.
  class Expectation
  
    # :call-seq: times(range) -> expectation
    #
    # Modifies expectation so that the number of calls to the expected method must be within a specific +range+.
    #
    # +range+ can be specified as an exact integer or as a range of integers
    #   object = mock()
    #   object.expects(:expected_method).times(3)
    #   3.times { object.expected_method }
    #   # => verify succeeds
    #
    #   object = mock()
    #   object.expects(:expected_method).times(3)
    #   2.times { object.expected_method }
    #   # => verify fails
    #
    #   object = mock()
    #   object.expects(:expected_method).times(2..4)
    #   3.times { object.expected_method }
    #   # => verify succeeds
    #
    #   object = mock()
    #   object.expects(:expected_method).times(2..4)
    #   object.expected_method
    #   # => verify fails
    def times(range)
      @cardinality = Cardinality.times(range)
      self
    end
  
    # :call-seq: once() -> expectation
    #
    # Modifies expectation so that the expected method must be called exactly once.
    # Note that this is the default behaviour for an expectation, but you may wish to use it for clarity/emphasis.
    #   object = mock()
    #   object.expects(:expected_method).once
    #   object.expected_method
    #   # => verify succeeds
    #
    #   object = mock()
    #   object.expects(:expected_method).once
    #   object.expected_method
    #   object.expected_method
    #   # => verify fails
    #
    #   object = mock()
    #   object.expects(:expected_method).once
    #   # => verify fails
    def once
      @cardinality = Cardinality.exactly(1)
      self
    end
  
    # :call-seq: never() -> expectation
    #
    # Modifies expectation so that the expected method must never be called.
    #   object = mock()
    #   object.expects(:expected_method).never
    #   object.expected_method
    #   # => verify fails
    #
    #   object = mock()
    #   object.expects(:expected_method).never
    #   object.expected_method
    #   # => verify succeeds
    def never
      @cardinality = Cardinality.exactly(0)
      self
    end
  
    # :call-seq: at_least(minimum_number_of_times) -> expectation
    #
    # Modifies expectation so that the expected method must be called at least a +minimum_number_of_times+.
    #   object = mock()
    #   object.expects(:expected_method).at_least(2)
    #   3.times { object.expected_method }
    #   # => verify succeeds
    #
    #   object = mock()
    #   object.expects(:expected_method).at_least(2)
    #   object.expected_method
    #   # => verify fails
    def at_least(minimum_number_of_times)
      @cardinality = Cardinality.at_least(minimum_number_of_times)
      self
    end
  
    # :call-seq: at_least_once() -> expectation
    #
    # Modifies expectation so that the expected method must be called at least once.
    #   object = mock()
    #   object.expects(:expected_method).at_least_once
    #   object.expected_method
    #   # => verify succeeds
    #
    #   object = mock()
    #   object.expects(:expected_method).at_least_once
    #   # => verify fails
    def at_least_once
      at_least(1)
      self
    end
  
    # :call-seq: at_most(maximum_number_of_times) -> expectation
    #
    # Modifies expectation so that the expected method must be called at most a +maximum_number_of_times+.
    #   object = mock()
    #   object.expects(:expected_method).at_most(2)
    #   2.times { object.expected_method }
    #   # => verify succeeds
    #
    #   object = mock()
    #   object.expects(:expected_method).at_most(2)
    #   3.times { object.expected_method }
    #   # => verify fails
    def at_most(maximum_number_of_times)
      @cardinality = Cardinality.at_most(maximum_number_of_times)
      self
    end
  
    # :call-seq: at_most_once() -> expectation
    #
    # Modifies expectation so that the expected method must be called at most once.
    #   object = mock()
    #   object.expects(:expected_method).at_most_once
    #   object.expected_method
    #   # => verify succeeds
    #
    #   object = mock()
    #   object.expects(:expected_method).at_most_once
    #   2.times { object.expected_method }
    #   # => verify fails
    def at_most_once()
      at_most(1)
      self
    end
  
    # :call-seq: with(*expected_parameters, &matching_block) -> expectation
    #
    # Modifies expectation so that the expected method must be called with +expected_parameters+.
    #   object = mock()
    #   object.expects(:expected_method).with(:param1, :param2)
    #   object.expected_method(:param1, :param2)
    #   # => verify succeeds
    #
    #   object = mock()
    #   object.expects(:expected_method).with(:param1, :param2)
    #   object.expected_method(:param3)
    #   # => verify fails
    # May be used with parameter matchers in Mocha::ParameterMatchers.
    #
    # If a +matching_block+ is given, the block is called with the parameters passed to the expected method.
    # The expectation is matched if the block evaluates to +true+.
    #   object = mock()
    #   object.expects(:expected_method).with() { |value| value % 4 == 0 }
    #   object.expected_method(16)
    #   # => verify succeeds
    #
    #   object = mock()
    #   object.expects(:expected_method).with() { |value| value % 4 == 0 }
    #   object.expected_method(17)
    #   # => verify fails
    def with(*expected_parameters, &matching_block)
      @parameters_matcher = ParametersMatcher.new(expected_parameters, &matching_block)
      self
    end
  
    # :call-seq: yields(*parameters) -> expectation
    #
    # Modifies expectation so that when the expected method is called, it yields with the specified +parameters+.
    #   object = mock()
    #   object.expects(:expected_method).yields('result')
    #   yielded_value = nil
    #   object.expected_method { |value| yielded_value = value }
    #   yielded_value # => 'result'
    # May be called multiple times on the same expectation for consecutive invocations. Also see Expectation#then.
    #   object = mock()
    #   object.stubs(:expected_method).yields(1).then.yields(2)
    #   yielded_values_from_first_invocation = []
    #   yielded_values_from_second_invocation = []
    #   object.expected_method { |value| yielded_values_from_first_invocation << value } # first invocation
    #   object.expected_method { |value| yielded_values_from_second_invocation << value } # second invocation
    #   yielded_values_from_first_invocation # => [1]
    #   yielded_values_from_second_invocation # => [2]
    def yields(*parameters)
      @yield_parameters.add(*parameters)
      self
    end
    
    # :call-seq: multiple_yields(*parameter_groups) -> expectation
    #
    # Modifies expectation so that when the expected method is called, it yields multiple times per invocation with the specified +parameter_groups+.
    #   object = mock()
    #   object.expects(:expected_method).multiple_yields(['result_1', 'result_2'], ['result_3'])
    #   yielded_values = []
    #   object.expected_method { |*values| yielded_values << values }
    #   yielded_values # => [['result_1', 'result_2'], ['result_3]]
    # May be called multiple times on the same expectation for consecutive invocations. Also see Expectation#then.
    #   object = mock()
    #   object.stubs(:expected_method).multiple_yields([1, 2], [3]).then.multiple_yields([4], [5, 6])
    #   yielded_values_from_first_invocation = []
    #   yielded_values_from_second_invocation = []
    #   object.expected_method { |*values| yielded_values_from_first_invocation << values } # first invocation
    #   object.expected_method { |*values| yielded_values_from_second_invocation << values } # second invocation
    #   yielded_values_from_first_invocation # => [[1, 2], [3]]
    #   yielded_values_from_second_invocation # => [[4], [5, 6]]
    def multiple_yields(*parameter_groups)
      @yield_parameters.multiple_add(*parameter_groups)
      self
    end
    
    # :call-seq: returns(value) -> expectation
    #            returns(*values) -> expectation
    #
    # Modifies expectation so that when the expected method is called, it returns the specified +value+.
    #   object = mock()
    #   object.stubs(:stubbed_method).returns('result')
    #   object.stubbed_method # => 'result'
    #   object.stubbed_method # => 'result'
    # If multiple +values+ are given, these are returned in turn on consecutive calls to the method.
    #   object = mock()
    #   object.stubs(:stubbed_method).returns(1, 2)
    #   object.stubbed_method # => 1
    #   object.stubbed_method # => 2
    # May be called multiple times on the same expectation. Also see Expectation#then.
    #   object = mock()
    #   object.stubs(:expected_method).returns(1, 2).then.returns(3)
    #   object.expected_method # => 1
    #   object.expected_method # => 2
    #   object.expected_method # => 3
    # May be called in conjunction with Expectation#raises on the same expectation.
    #   object = mock()
    #   object.stubs(:expected_method).returns(1, 2).then.raises(Exception)
    #   object.expected_method # => 1
    #   object.expected_method # => 2
    #   object.expected_method # => raises exception of class Exception1
    # Note that in Ruby a method returning multiple values is exactly equivalent to a method returning an Array of those values.
    #   object = mock()
    #   object.stubs(:expected_method).returns([1, 2])
    #   x, y = object.expected_method
    #   x # => 1
    #   y # => 2
    def returns(*values)
      @return_values += ReturnValues.build(*values)
      self
    end
  
    # :call-seq: raises(exception = RuntimeError, message = nil) -> expectation
    #
    # Modifies expectation so that when the expected method is called, it raises the specified +exception+ with the specified +message+.
    #   object = mock()
    #   object.expects(:expected_method).raises(Exception, 'message')
    #   object.expected_method # => raises exception of class Exception and with message 'message'
    # May be called multiple times on the same expectation. Also see Expectation#then.
    #   object = mock()
    #   object.stubs(:expected_method).raises(Exception1).then.raises(Exception2)
    #   object.expected_method # => raises exception of class Exception1
    #   object.expected_method # => raises exception of class Exception2
    # May be called in conjunction with Expectation#returns on the same expectation.
    #   object = mock()
    #   object.stubs(:expected_method).raises(Exception).then.returns(2, 3)
    #   object.expected_method # => raises exception of class Exception1
    #   object.expected_method # => 2
    #   object.expected_method # => 3
    def raises(exception = RuntimeError, message = nil)
      @return_values += ReturnValues.new(ExceptionRaiser.new(exception, message))
      self
    end

    # :call-seq: then() -> expectation
    #            then(state_machine.is(state)) -> expectation
    #
    # <tt>then()</tt> is used as syntactic sugar to improve readability. It has no effect on state of the expectation.
    #   object = mock()
    #   object.stubs(:expected_method).returns(1, 2).then.raises(Exception).then.returns(4)
    #   object.expected_method # => 1
    #   object.expected_method # => 2
    #   object.expected_method # => raises exception of class Exception
    #   object.expected_method # => 4
    #
    # <tt>then(state_machine.is(state))</tt> is used to change the +state_machine+ to the specified +state+ when the invocation occurs.
    #
    # See also Standalone#states, StateMachine and Expectation#when.
    #   power = states('power').starts_as('off')
    #
    #   radio = mock('radio')
    #   radio.expects(:switch_on).then(power.is('on'))
    #   radio.expects(:select_channel).with('BBC Radio 4').when(power.is('on'))
    #   radio.expects(:adjust_volume).with(+5).when(power.is('on'))
    #   radio.expects(:select_channel).with('BBC World Service').when(power.is('on'))
    #   radio.expects(:adjust_volume).with(-5).when(power.is('on'))
    #   radio.expects(:switch_off).then(power.is('off'))
    def then(*parameters)
      if parameters.length == 1
        state = parameters.first
        add_side_effect(ChangeStateSideEffect.new(state))
      end
      self
    end
    
    # :call-seq: when(state_machine.is(state)) -> exception
    #
    # Constrains the expectation to occur only when the +state_machine+ is in the named +state+.
    #
    # See also Standalone#states, StateMachine#starts_as and Expectation#then.
    #   power = states('power').starts_as('off')
    #
    #   radio = mock('radio')
    #   radio.expects(:switch_on).then(power.is('on'))
    #   radio.expects(:select_channel).with('BBC Radio 4').when(power.is('on'))
    #   radio.expects(:adjust_volume).with(+5).when(power.is('on'))
    #   radio.expects(:select_channel).with('BBC World Service').when(power.is('on'))
    #   radio.expects(:adjust_volume).with(-5).when(power.is('on'))
    #   radio.expects(:switch_off).then(power.is('off'))
    def when(state_predicate)
      add_ordering_constraint(InStateOrderingConstraint.new(state_predicate))
      self
    end
    
    # :call-seq: in_sequence(*sequences) -> expectation
    #
    # Constrains this expectation so that it must be invoked at the current point in the sequence.
    #
    # To expect a sequence of invocations, write the expectations in order and add the in_sequence(sequence) clause to each one.
    #
    # Expectations in a sequence can have any invocation count.
    #
    # If an expectation in a sequence is stubbed, rather than expected, it can be skipped in the sequence.
    #
    # See also Standalone#sequence.
    #   breakfast = sequence('breakfast')
    #
    #   egg = mock('egg')
    #   egg.expects(:crack).in_sequence(breakfast)
    #   egg.expects(:fry).in_sequence(breakfast)
    #   egg.expects(:eat).in_sequence(breakfast)
    def in_sequence(*sequences)
      sequences.each { |sequence| add_in_sequence_ordering_constraint(sequence) }
      self
    end
    
    # :stopdoc:
    
    attr_reader :backtrace

    def initialize(mock, expected_method_name, backtrace = nil)
      @mock = mock
      @method_matcher = MethodMatcher.new(expected_method_name.to_sym)
      @parameters_matcher = ParametersMatcher.new
      @ordering_constraints = []
      @side_effects = []
      @cardinality, @invocation_count = Cardinality.exactly(1), 0
      @return_values = ReturnValues.new
      @yield_parameters = YieldParameters.new
      @backtrace = backtrace || caller
    end
    
    def add_ordering_constraint(ordering_constraint)
      @ordering_constraints << ordering_constraint
    end
    
    def add_in_sequence_ordering_constraint(sequence)
      sequence.constrain_as_next_in_sequence(self)
    end
    
    def add_side_effect(side_effect)
      @side_effects << side_effect
    end
    
    def perform_side_effects
      @side_effects.each { |side_effect| side_effect.perform }
    end
    
    def in_correct_order?
      @ordering_constraints.all? { |ordering_constraint| ordering_constraint.allows_invocation_now? }
    end
    
    def matches_method?(method_name)
      @method_matcher.match?(method_name)
    end
    
    def match?(actual_method_name, *actual_parameters)
      @method_matcher.match?(actual_method_name) && @parameters_matcher.match?(actual_parameters) && in_correct_order?
    end
    
    def invocations_allowed?
      @cardinality.invocations_allowed?(@invocation_count)
    end

    def satisfied?
      @cardinality.satisfied?(@invocation_count)
    end
  
    def invoke
      @invocation_count += 1
      perform_side_effects()
      if block_given? then
        @yield_parameters.next_invocation.each do |yield_parameters|
          yield(*yield_parameters)
        end
      end
      @return_values.next
    end

    def verified?(assertion_counter = nil)
      assertion_counter.increment if assertion_counter && @cardinality.needs_verifying?
      @cardinality.verified?(@invocation_count)
    end
    
    def used?
      @cardinality.used?(@invocation_count)
    end
    
    def mocha_inspect
      message = "#{@cardinality.mocha_inspect}, "
      message << case @invocation_count
        when 0 then "not yet invoked"
        when 1 then "already invoked once"
        when 2 then "already invoked twice"
        else "already invoked #{@invocation_count} times"
      end
      message << ": "
      message << method_signature
      message << "; #{@ordering_constraints.map { |oc| oc.mocha_inspect }.join("; ")}" unless @ordering_constraints.empty?
      message
    end
    
    def method_signature
      "#{@mock.mocha_inspect}.#{@method_matcher.mocha_inspect}#{@parameters_matcher.mocha_inspect}"
    end
      
    # :startdoc:
    
  end

end
