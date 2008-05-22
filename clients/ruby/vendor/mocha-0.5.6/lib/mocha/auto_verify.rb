require 'mocha/mock'
require 'mocha/sequence'

module Mocha # :nodoc:
  
  # Methods added to TestCase allowing creation of traditional mock objects.
  #
  # Mocks created this way will have their expectations automatically verified at the end of the test.
  #
  # See Mock for methods on mock objects.
  module AutoVerify
  
    def mocks # :nodoc:
      @mocks ||= []
    end
  
    def reset_mocks # :nodoc:
      @mocks = nil
    end
    
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
    # +block+ is a block to be evaluated against the mock object instance, giving an alernative way to set up expectations & stubs.
    #
    # Note that (contrary to expectations set up by #stub) these expectations <b>must</b> be fulfilled during the test.
    #   def test_product
    #     product = mock('ipod_product', :manufacturer => 'ipod', :price => 100)
    #     assert_equal 'ipod', product.manufacturer
    #     assert_equal 100, product.price
    #     # an error will be raised unless both Product#manufacturer and Product#price have been called
    #   end 
    def mock(*arguments, &block)
      name = arguments.shift if arguments.first.is_a?(String)
      expectations = arguments.shift || {}
      mock = Mock.new(name, &block)
      mock.expects(expectations)
      mocks << mock
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
    #
    # +block+ is a block to be evaluated against the mock object instance, giving an alernative way to set up expectations & stubs.
    #
    # Note that (contrary to expectations set up by #mock) these expectations <b>need not</b> be fulfilled during the test.
    #   def test_product
    #     product = stub('ipod_product', :manufacturer => 'ipod', :price => 100)
    #     assert_equal 'ipod', product.manufacturer
    #     assert_equal 100, product.price
    #     # an error will not be raised even if Product#manufacturer and Product#price have not been called
    #   end
    def stub(*arguments, &block)
      name = arguments.shift if arguments.first.is_a?(String)
      expectations = arguments.shift || {}
      stub = Mock.new(name, &block)
      stub.stubs(expectations)
      mocks << stub
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
      stub = Mock.new(name, &block)
      stub.stub_everything
      stub.stubs(expectations)
      mocks << stub
      stub
    end
    
    def verify_mocks # :nodoc:
      mocks.each { |mock| mock.verify { yield if block_given? } }
    end

    def teardown_mocks # :nodoc:
      reset_mocks
    end
    
    def sequence(name) # :nodoc:
      Sequence.new(name)
    end
  
  end
  
end