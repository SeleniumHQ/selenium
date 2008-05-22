module Dust #:nodoc:
  # Dust::DefinitionError is raised when you attempt to define a disallowed method within a test file.
  # 
  #    Test::Unit::TestCase.disallow_setup!
  # 
  #    unit_tests do
  #      def setup
  #        ...
  #      end
  #        
  #      test "name" do
  #        ...
  #      end
  #    end
  # 
  # The above code will generate the following error
  #    Dust::DefinitionError: setup is not allowed on class Units::[TestClassName]
  class DefinitionError < StandardError
  end
end