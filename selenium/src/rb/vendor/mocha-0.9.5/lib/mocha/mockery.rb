require 'mocha/central'
require 'mocha/mock'
require 'mocha/names'
require 'mocha/state_machine'
require 'mocha/logger'
require 'mocha/configuration'
require 'mocha/stubbing_error'

module Mocha
  
  class Mockery
    
    class << self
      
      def instance
        @instance ||= new
      end
      
      def reset_instance
        @instance = nil
      end
      
    end
    
    def named_mock(name, &block)
      add_mock(Mock.new(Name.new(name), &block))
    end
    
    def unnamed_mock(&block)
      add_mock(Mock.new(&block))
    end
    
    def mock_impersonating(object, &block)
      add_mock(Mock.new(ImpersonatingName.new(object), &block))
    end
    
    def mock_impersonating_any_instance_of(klass, &block)
      add_mock(Mock.new(ImpersonatingAnyInstanceName.new(klass), &block))
    end
    
    def new_state_machine(name)
      add_state_machine(StateMachine.new(name))
    end
    
    def verify(assertion_counter = nil)
      unless mocks.all? { |mock| mock.__verified__?(assertion_counter) }
        message = "not all expectations were satisfied\n#{mocha_inspect}"
        if unsatisfied_expectations.empty?
          backtrace = caller
        else
          backtrace = unsatisfied_expectations[0].backtrace
        end
        raise ExpectationError.new(message, backtrace)
      end
      expectations.each do |e|
        unless Mocha::Configuration.allow?(:stubbing_method_unnecessarily)
          unless e.used?
            on_stubbing_method_unnecessarily(e)
          end
        end
      end
    end
    
    def teardown
      stubba.unstub_all
      reset
    end
    
    def stubba
      @stubba ||= Central.new
    end
    
    def mocks
      @mocks ||= []
    end
    
    def state_machines
      @state_machines ||= []
    end
    
    def mocha_inspect
      message = ""
      message << "unsatisfied expectations:\n- #{unsatisfied_expectations.map { |e| e.mocha_inspect }.join("\n- ")}\n" unless unsatisfied_expectations.empty?
      message << "satisfied expectations:\n- #{satisfied_expectations.map { |e| e.mocha_inspect }.join("\n- ")}\n" unless satisfied_expectations.empty?
      message << "states:\n- #{state_machines.map { |sm| sm.mocha_inspect }.join("\n- ")}" unless state_machines.empty?
      message
    end
    
    def on_stubbing(object, method)
      method = RUBY_VERSION < '1.9' ? method.to_s : method.to_sym
      unless Mocha::Configuration.allow?(:stubbing_non_existent_method)
        unless object.method_exists?(method, include_public_methods = true)
          on_stubbing_non_existent_method(object, method)
        end
      end
      unless Mocha::Configuration.allow?(:stubbing_non_public_method)
        if object.method_exists?(method, include_public_methods = false)
          on_stubbing_non_public_method(object, method)
        end
      end
      unless Mocha::Configuration.allow?(:stubbing_method_on_non_mock_object)
        on_stubbing_method_on_non_mock_object(object, method)
      end
    end
    
    def on_stubbing_non_existent_method(object, method)
      if Mocha::Configuration.prevent?(:stubbing_non_existent_method)
        raise StubbingError.new("stubbing non-existent method: #{object.mocha_inspect}.#{method}", caller)
      end
      if Mocha::Configuration.warn_when?(:stubbing_non_existent_method)
        logger.warn "stubbing non-existent method: #{object.mocha_inspect}.#{method}"
      end
    end
    
    def on_stubbing_non_public_method(object, method)
      if Mocha::Configuration.prevent?(:stubbing_non_public_method)
        raise StubbingError.new("stubbing non-public method: #{object.mocha_inspect}.#{method}", caller)
      end
      if Mocha::Configuration.warn_when?(:stubbing_non_public_method)
        logger.warn "stubbing non-public method: #{object.mocha_inspect}.#{method}"
      end
    end
    
    def on_stubbing_method_on_non_mock_object(object, method)
      if Mocha::Configuration.prevent?(:stubbing_method_on_non_mock_object)
        raise StubbingError.new("stubbing method on non-mock object: #{object.mocha_inspect}.#{method}", caller)
      end
      if Mocha::Configuration.warn_when?(:stubbing_method_on_non_mock_object)
        logger.warn "stubbing method on non-mock object: #{object.mocha_inspect}.#{method}"
      end
    end
    
    def on_stubbing_method_unnecessarily(expectation)
      if Mocha::Configuration.prevent?(:stubbing_method_unnecessarily)
        raise StubbingError.new("stubbing method unnecessarily: #{expectation.method_signature}", expectation.backtrace)
      end
      if Mocha::Configuration.warn_when?(:stubbing_method_unnecessarily)
        logger.warn "stubbing method unnecessarily: #{expectation.method_signature}"
      end
    end
    
    attr_writer :logger
    
    def logger
      @logger ||= Logger.new($stderr)
    end
    
    
    private
    
    def expectations
      mocks.map { |mock| mock.expectations.to_a }.flatten
    end
    
    def unsatisfied_expectations
      expectations.reject { |e| e.verified? }
    end
    
    def satisfied_expectations
      expectations.select { |e| e.verified? }
    end
    
    def add_mock(mock)
      mocks << mock
      mock
    end
    
    def add_state_machine(state_machine)
      state_machines << state_machine
      state_machine
    end
    
    def reset
      @stubba = nil
      @mocks = nil
      @state_machines = nil
    end
    
  end
  
end
