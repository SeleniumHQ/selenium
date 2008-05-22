module Test #:nodoc:
  module Unit #:nodoc:
    class TestCase
      # call-seq: disallow_setup!
      # 
      # Used to disallow setup methods in test specifications.
      # 
      #    Test::Unit::TestCase.disallow_setup!
      #
      # A test specification can override this behavior by passing :setup in the :allow options.
      # 
      #    unit_tests :allow => :setup do
      #      def setup
      #        ...
      #      end        
      #                                              
      #      test "verify something" do                                   
      #        ...
      #      end                                                     
      #    end
      def self.disallow_setup!
        @disallow_setup = true
      end
  
      def self.disallow_setup? #:nodoc:
        @disallow_setup
      end
  
      # call-seq: disallow_helpers!
      # 
      # Used to disallow helper methods in test specifications.
      # 
      #    Test::Unit::TestCase.disallow_helper!
      # 
      # A test specification can override this behavior by passing the helper name (as a symbol) in the :allow options.
      # 
      #    unit_tests :allow => [:create_something, :destroy_something] do
      #      test "verify something" do                                   
      #        ...
      #      end                   
      #                                   
      #      def create_something
      #        ...
      #      end                          
      #                            
      #      def destroy_something
      #        ...
      #      end                                                     
      #    end
      def self.disallow_helpers!
        @disallow_helpers = true
      end
  
      def self.disallow_helpers? #:nodoc:
        @disallow_helpers
      end

      # call-seq: test(name, &block)
      # 
      # Used to define a test and assign it a descriptive name.
      # 
      #    unit_tests do
      #      test "verify something" do                                   
      #        ...
      #      end                                                     
      #    end                                                       
      def self.test(name, &block)
        test_name = "test_#{name.gsub(/[\s]/,'_')}".to_sym
        raise "#{test_name} is already defined in #{self}" if self.instance_methods.include? test_name.to_s
        define_method test_name do
          instance_eval &block
        end
      end
    end
  end
end