module Mocha

  module MiniTestCaseAdapter

    class AssertionCounter
      def initialize(test_case)
        @test_case = test_case
      end

      def increment
        @test_case._assertions += 1
      end
    end

    def self.included(base)
      base.class_eval do

        alias_method :run_before_mocha_mini_test_adapter, :run

        def run runner
          assertion_counter = AssertionCounter.new(self)
          result = '.'
          begin
            begin
              @passed = nil
              self.setup
              self.__send__ self.name
              mocha_verify(assertion_counter)
              @passed = true
            rescue Exception => e
              @passed = false
              result = runner.puke(self.class, self.name, e)
            ensure
              begin
                self.teardown
              rescue Exception => e
                result = runner.puke(self.class, self.name, e)
              end
            end
          ensure
            mocha_teardown
          end
          result
        end

      end
    end

  end
end
