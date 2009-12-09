require 'mocha/expectation_error'

module Mocha
  
  module TestCaseAdapter
    
    class AssertionCounter
      
      def initialize(test_result)
        @test_result = test_result
      end
      
      def increment
        @test_result.add_assertion
      end
      
    end

    def self.included(base)
      if RUBY_VERSION < '1.8.6'
        base.class_eval do

          alias_method :run_before_mocha_test_case_adapter, :run

          def run(result)
            assertion_counter = AssertionCounter.new(result)
            yield(Test::Unit::TestCase::STARTED, name)
            @_result = result
            begin
              begin
                setup
                __send__(@method_name)
                mocha_verify(assertion_counter)
              rescue Mocha::ExpectationError => e
                add_failure(e.message, e.backtrace)
              rescue Test::Unit::AssertionFailedError => e
                add_failure(e.message, e.backtrace)
              rescue StandardError, ScriptError
                add_error($!)
              ensure
                begin
                  teardown
                rescue Test::Unit::AssertionFailedError => e
                  add_failure(e.message, e.backtrace)
                rescue StandardError, ScriptError
                  add_error($!)
                end
              end
            ensure
              mocha_teardown
            end
            result.add_run
            yield(Test::Unit::TestCase::FINISHED, name)
          end

        end
      else
        base.class_eval do

          alias_method :run_before_mocha_test_case_adapter, :run

          def run(result)
            assertion_counter = AssertionCounter.new(result)
            yield(Test::Unit::TestCase::STARTED, name)
            @_result = result
            begin
              begin
                setup
                __send__(@method_name)
                mocha_verify(assertion_counter)
              rescue Mocha::ExpectationError => e
                add_failure(e.message, e.backtrace)
              rescue Test::Unit::AssertionFailedError => e
                add_failure(e.message, e.backtrace)
              rescue Exception
                raise if Test::Unit::TestCase::PASSTHROUGH_EXCEPTIONS.include? $!.class
                add_error($!)
              ensure
                begin
                  teardown
                rescue Test::Unit::AssertionFailedError => e
                  add_failure(e.message, e.backtrace)
                rescue Exception
                  raise if Test::Unit::TestCase::PASSTHROUGH_EXCEPTIONS.include? $!.class
                  add_error($!)
                end
              end
            ensure
              mocha_teardown
            end
            result.add_run
            yield(Test::Unit::TestCase::FINISHED, name)
          end
                
        end
        
      end
      
    end
    
  end
  
end