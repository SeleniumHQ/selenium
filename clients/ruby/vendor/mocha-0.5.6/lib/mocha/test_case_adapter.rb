require 'mocha/expectation_error'

module Mocha
  
  module TestCaseAdapter

    def self.included(base)
      base.class_eval do

        alias_method :run_before_mocha_test_case_adapter, :run

        def run(result)
          yield(Test::Unit::TestCase::STARTED, name)
          @_result = result
          begin
            mocha_setup
            begin
              setup
              __send__(@method_name)
              mocha_verify { add_assertion }
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
      
    end
    
  end
  
end