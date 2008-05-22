require 'mocha/auto_verify'
require 'mocha/parameter_matchers'
require 'mocha/setup_and_teardown'

module Mocha
  
  module Standalone
    
    include AutoVerify
    include ParameterMatchers
    include SetupAndTeardown
    
    def mocha_setup
      setup_stubs
    end
    
    def mocha_verify(&block)
      verify_mocks(&block)
      verify_stubs(&block)
    end
    
    def mocha_teardown
      begin
        teardown_mocks
      ensure
        teardown_stubs
      end
    end
    
  end
  
end