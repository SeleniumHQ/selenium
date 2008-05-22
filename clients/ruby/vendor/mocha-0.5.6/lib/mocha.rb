require 'mocha_standalone'
require 'mocha/test_case_adapter'

require 'test/unit/testcase'

module Test

  module Unit

    class TestCase
  
      include Mocha::Standalone
      include Mocha::TestCaseAdapter
      
    end

  end

end