require "rubygems"
gem "rspec", "=1.1.12"
require 'spec'
require 'spec/example/example_group'

#
# Monkey-patch RSpec Example Group so that we can track whether an
# example already failed or not in an after(:each) block
#
# useful to only capture Selenium screenshots when a test fails  
#
# Only changed execution_error to be an instance variable (in lieu of 
# a local variable).
#
module Spec
  module Example
    
    class ExampleGroup
      attr_reader :execution_error

      def execute(options, instance_variables)
        options.reporter.example_started(self)
        set_instance_variables_from_hash(instance_variables)
        
        @execution_error = nil
        Timeout.timeout(options.timeout) do
          begin
            before_each_example
            eval_block
          rescue Exception => e
            @execution_error ||= e
          end
          begin
            after_each_example
          rescue Exception => e
            @execution_error ||= e
          end
        end

        options.reporter.example_finished(self, @execution_error)
        success = @execution_error.nil? || ExamplePendingError === @execution_error
      end
      
    end
  end
end
