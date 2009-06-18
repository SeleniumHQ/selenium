require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'test_runner'
require 'mocha/configuration'

module AcceptanceTest
  
  class FakeLogger
  
    attr_reader :warnings
    
    def initialize
      @warnings = []
    end
    
    def warn(message)
      @warnings << message
    end
  
  end
  
  attr_reader :logger

  include TestRunner
  
  def setup_acceptance_test
    Mocha::Configuration.reset_configuration
    @logger = FakeLogger.new
    mockery = Mocha::Mockery.instance
    @original_logger = mockery.logger
    mockery.logger = @logger
  end
  
  def teardown_acceptance_test
    Mocha::Configuration.reset_configuration
    Mocha::Mockery.instance.logger = @original_logger
  end
  
end
