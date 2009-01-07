require 'mocha/expectation'
require 'mocha/expectation_list'
require 'mocha/metaclass'
require 'mocha/names'
require 'mocha/mockery'
require 'mocha/method_matcher'
require 'mocha/parameters_matcher'
require 'mocha/unexpected_invocation'
require 'mocha/argument_iterator'

module Mocha # :nodoc:
  
  # Traditional mock object.
  #
  # Methods return an Expectation which can be further modified by methods on Expectation.
  class Mock
    
    # :call-seq: expects(method_name) -> expectation
    #            expects(method_names_vs_return_values) -> last expectation
    #
    # Adds an expectation that a method identified by +method_name+ Symbol/String must be called exactly once with any parameters.
    # Returns the new expectation which can be further modified by methods on Expectation.
    #   object = mock()
    #   object.expects(:method1)
    #   object.method1
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method1)
    #   # error raised, because method1 not called exactly once
    # If +method_names_vs_return_values+ is a +Hash+, an expectation will be set up for each entry using the key as +method_name+ and value as +return_value+.
    #   object = mock()
    #   object.expects(:method1 => :result1, :method2 => :result2)
    #
    #   # exactly equivalent to
    #
    #   object = mock()
    #   object.expects(:method1).returns(:result1)
    #   object.expects(:method2).returns(:result2)
    #
    # Aliased by <tt>\_\_expects\_\_</tt>
    def expects(method_name_or_hash, backtrace = nil)
      iterator = ArgumentIterator.new(method_name_or_hash)
      iterator.each { |*args|
        method_name = args.shift
        ensure_method_not_already_defined(method_name)
        expectation = Expectation.new(self, method_name, backtrace)
        expectation.returns(args.shift) if args.length > 0
        @expectations.add(expectation)
      }
    end
    
    # :call-seq: stubs(method_name) -> expectation
    #            stubs(method_names_vs_return_values) -> last expectation
    #
    # Adds an expectation that a method identified by +method_name+ Symbol/String may be called any number of times with any parameters.
    # Returns the new expectation which can be further modified by methods on Expectation.
    #   object = mock()
    #   object.stubs(:method1)
    #   object.method1
    #   object.method1
    #   # no error raised
    # If +method_names_vs_return_values+ is a +Hash+, an expectation will be set up for each entry using the key as +method_name+ and value as +return_value+.
    #   object = mock()
    #   object.stubs(:method1 => :result1, :method2 => :result2)
    #
    #   # exactly equivalent to
    #
    #   object = mock()
    #   object.stubs(:method1).returns(:result1)
    #   object.stubs(:method2).returns(:result2)
    #
    # Aliased by <tt>\_\_stubs\_\_</tt>
    def stubs(method_name_or_hash, backtrace = nil)
      iterator = ArgumentIterator.new(method_name_or_hash)
      iterator.each { |*args|
        method_name = args.shift
        ensure_method_not_already_defined(method_name)
        expectation = Expectation.new(self, method_name, backtrace)
        expectation.at_least(0)
        expectation.returns(args.shift) if args.length > 0
        @expectations.add(expectation)
      }
    end
    
    # :call-seq: responds_like(responder) -> mock
    #
    # Constrains the +mock+ so that it can only expect or stub methods to which +responder+ responds. The constraint is only applied at method invocation time.
    #
    # A +NoMethodError+ will be raised if the +responder+ does not <tt>respond_to?</tt> a method invocation (even if the method has been expected or stubbed).
    #
    # The +mock+ will delegate its <tt>respond_to?</tt> method to the +responder+.
    #   class Sheep
    #     def chew(grass); end
    #     def self.number_of_legs; end
    #   end
    #
    #   sheep = mock('sheep')
    #   sheep.expects(:chew)
    #   sheep.expects(:foo)
    #   sheep.respond_to?(:chew) # => true
    #   sheep.respond_to?(:foo) # => true
    #   sheep.chew
    #   sheep.foo
    #   # no error raised
    #
    #   sheep = mock('sheep')
    #   sheep.responds_like(Sheep.new)
    #   sheep.expects(:chew)
    #   sheep.expects(:foo)
    #   sheep.respond_to?(:chew) # => true
    #   sheep.respond_to?(:foo) # => false
    #   sheep.chew
    #   sheep.foo # => raises NoMethodError exception
    #
    #   sheep_class = mock('sheep_class')
    #   sheep_class.responds_like(Sheep)
    #   sheep_class.stubs(:number_of_legs).returns(4)
    #   sheep_class.expects(:foo)
    #   sheep_class.respond_to?(:number_of_legs) # => true
    #   sheep_class.respond_to?(:foo) # => false
    #   assert_equal 4, sheep_class.number_of_legs
    #   sheep_class.foo # => raises NoMethodError exception
    #
    # Aliased by +quacks_like+
    def responds_like(object)
      @responder = object
      self
    end
    
    # :stopdoc:
    
    def initialize(name = nil, &block)
      @name = name || DefaultName.new(self)
      @expectations = ExpectationList.new
      @everything_stubbed = false
      @responder = nil
      instance_eval(&block) if block
    end

    attr_reader :everything_stubbed, :expectations

    alias_method :__expects__, :expects

    alias_method :__stubs__, :stubs
    
    alias_method :quacks_like, :responds_like

    def stub_everything
      @everything_stubbed = true
    end
    
    def method_missing(symbol, *arguments, &block)
      if @responder and not @responder.respond_to?(symbol)
        raise NoMethodError, "undefined method `#{symbol}' for #{self.mocha_inspect} which responds like #{@responder.mocha_inspect}"
      end
      if matching_expectation_allowing_invocation = @expectations.match_allowing_invocation(symbol, *arguments)
        matching_expectation_allowing_invocation.invoke(&block)
      else
        if (matching_expectation = @expectations.match(symbol, *arguments)) || (!matching_expectation && !@everything_stubbed)
          message = UnexpectedInvocation.new(self, symbol, *arguments).to_s
          message << Mockery.instance.mocha_inspect
          raise ExpectationError.new(message, caller)
        end
      end
    end
    
    def respond_to?(symbol, include_private = false)
      if @responder then
        if @responder.method(:respond_to?).arity > 1
          @responder.respond_to?(symbol, include_private)
        else
          @responder.respond_to?(symbol)
        end
      else
        @expectations.matches_method?(symbol)
      end
    end
    
    def __verified__?(assertion_counter = nil)
      @expectations.verified?(assertion_counter)
    end
    
    def mocha_inspect
      @name.mocha_inspect
    end
    
    def inspect
      mocha_inspect
    end
    
    def ensure_method_not_already_defined(method_name)
      self.__metaclass__.send(:undef_method, method_name) if self.__metaclass__.method_defined?(method_name)
    end

    # :startdoc:

  end

end
