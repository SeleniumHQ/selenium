require 'mocha/parameter_matchers'
require 'mocha/mockery'
require 'mocha/sequence'

module Mocha # :nodoc:
  
  # Methods added to Test::Unit::TestCase or equivalent.
  module Standalone
    
    include ParameterMatchers
    
    # :call-seq: mock(name, &block) -> mock object
    #            mock(expected_methods = {}, &block) -> mock object
    #            mock(name, expected_methods = {}, &block) -> mock object
    #
    # Creates a mock object.
    #
    # +name+ is a +String+ identifier for the mock object.
    #
    # +expected_methods+ is a +Hash+ with expected method name symbols as keys and corresponding return values as values.
    #
    # Note that (contrary to expectations set up by #stub) these expectations <b>must</b> be fulfilled during the test.
    #   def test_product
    #     product = mock('ipod_product', :manufacturer => 'ipod', :price => 100)
    #     assert_equal 'ipod', product.manufacturer
    #     assert_equal 100, product.price
    #     # an error will be raised unless both Product#manufacturer and Product#price have been called
    #   end 
    #
    # +block+ is an optional block to be evaluated against the mock object instance, giving an alernative way to set up expectations & stubs.
    #   def test_product
    #     product = mock('ipod_product') do
    #       expects(:manufacturer).returns('ipod')
    #       expects(:price).returns(100)
    #     end
    #     assert_equal 'ipod', product.manufacturer
    #     assert_equal 100, product.price
    #     # an error will be raised unless both Product#manufacturer and Product#price have been called
    #   end 
    def mock(*arguments, &block)
      name = arguments.shift if arguments.first.is_a?(String)
      expectations = arguments.shift || {}
      mock = name ? Mockery.instance.named_mock(name, &block) : Mockery.instance.unnamed_mock(&block)
      mock.expects(expectations)
      mock
    end
    
    # :call-seq: stub(name, &block) -> mock object
    #            stub(stubbed_methods = {}, &block) -> mock object
    #            stub(name, stubbed_methods = {}, &block) -> mock object
    #
    # Creates a mock object.
    #
    # +name+ is a +String+ identifier for the mock object.
    #
    # +stubbed_methods+ is a +Hash+ with stubbed method name symbols as keys and corresponding return values as values.
    # Note that (contrary to expectations set up by #mock) these expectations <b>need not</b> be fulfilled during the test.
    #   def test_product
    #     product = stub('ipod_product', :manufacturer => 'ipod', :price => 100)
    #     assert_equal 'ipod', product.manufacturer
    #     assert_equal 100, product.price
    #     # an error will not be raised even if Product#manufacturer and Product#price have not been called
    #   end
    #
    # +block+ is an optional block to be evaluated against the mock object instance, giving an alernative way to set up expectations & stubs.
    #   def test_product
    #     product = stub('ipod_product') do
    #       stubs(:manufacturer).returns('ipod')
    #       stubs(:price).returns(100)
    #     end
    #     assert_equal 'ipod', product.manufacturer
    #     assert_equal 100, product.price
    #     # an error will not be raised even if Product#manufacturer and Product#price have not been called
    #   end
    def stub(*arguments, &block)
      name = arguments.shift if arguments.first.is_a?(String)
      expectations = arguments.shift || {}
      stub = name ? Mockery.instance.named_mock(name, &block) : Mockery.instance.unnamed_mock(&block)
      stub.stubs(expectations)
      stub
    end
    
    # :call-seq: stub_everything(name, &block) -> mock object
    #            stub_everything(stubbed_methods = {}, &block) -> mock object
    #            stub_everything(name, stubbed_methods = {}, &block) -> mock object
    #
    # Creates a mock object that accepts calls to any method.
    #
    # By default it will return +nil+ for any method call.
    #
    # +block+ is a block to be evaluated against the mock object instance, giving an alernative way to set up expectations & stubs.
    #
    # +name+ and +stubbed_methods+ work in the same way as for #stub.
    #   def test_product
    #     product = stub_everything('ipod_product', :price => 100)
    #     assert_nil product.manufacturer
    #     assert_nil product.any_old_method
    #     assert_equal 100, product.price
    #   end
    def stub_everything(*arguments, &block)
      name = arguments.shift if arguments.first.is_a?(String)
      expectations = arguments.shift || {}
      stub = name ? Mockery.instance.named_mock(name, &block) : Mockery.instance.unnamed_mock(&block)
      stub.stub_everything
      stub.stubs(expectations)
      stub
    end
    
    # :call-seq: sequence(name) -> sequence
    #
    # Returns a new sequence that is used to constrain the order in which expectations can occur.
    #
    # Specify that an expected invocation must occur in within a named +sequence+ by using Expectation#in_sequence.
    #
    # See also Expectation#in_sequence.
    #   breakfast = sequence('breakfast')
    #
    #   egg = mock('egg')
    #   egg.expects(:crack).in_sequence(breakfast)
    #   egg.expects(:fry).in_sequence(breakfast)
    #   egg.expects(:eat).in_sequence(breakfast)
    def sequence(name)
      Sequence.new(name)
    end
    
    # :call-seq: states(name) -> state_machine
    #
    # Returns a new +state_machine+ that is used to constrain the order in which expectations can occur.
    #
    # Specify the initial +state+ of the +state_machine+ by using StateMachine#starts_as.
    #
    # Specify that an expected invocation should change the +state+ of the +state_machine+ by using Expectation#then.
    #
    # Specify that an expected invocation should be constrained to occur within a particular +state+ by using Expectation#when.
    #
    # A test can contain multiple +state_machines+.
    #
    # See also Expectation#then, Expectation#when and StateMachine.
    #   power = states('power').starts_as('off')
    #
    #   radio = mock('radio')
    #   radio.expects(:switch_on).then(power.is('on'))
    #   radio.expects(:select_channel).with('BBC Radio 4').when(power.is('on'))
    #   radio.expects(:adjust_volume).with(+5).when(power.is('on'))
    #   radio.expects(:select_channel).with('BBC World Service').when(power.is('on'))
    #   radio.expects(:adjust_volume).with(-5).when(power.is('on'))
    #   radio.expects(:switch_off).then(power.is('off'))
    def states(name)
      Mockery.instance.new_state_machine(name)
    end
    
    def mocha_setup # :nodoc:
    end
    
    def mocha_verify(assertion_counter = nil) # :nodoc:
      Mockery.instance.verify(assertion_counter)
    end
    
    def mocha_teardown # :nodoc:
      Mockery.instance.teardown
      Mockery.reset_instance
    end
    
  end
  
end
