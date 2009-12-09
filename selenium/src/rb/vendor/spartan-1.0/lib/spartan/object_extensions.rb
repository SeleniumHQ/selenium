module Spartan

  module ObjectExtensions

   def unit_tests(&block)
     ::Spartan::Internals.define_test_class("UnitTest", &block)
   end

   def functional_tests(&block)
     ::Spartan::Internals.define_test_class("FunctionalTest", &block)
   end

   def integration_tests(&block)
     ::Spartan::Internals.define_test_class("IntegrationTest", &block)
   end

  end
end