require 'mocha_standalone'
require 'mocha/configuration'

if RUBY_VERSION < '1.9'
  begin
    require 'rubygems'
    begin
      gem 'minitest', '>=1.3'
      require 'minitest/unit'
    rescue Gem::LoadError
      # Compatible version of MiniTest gem not available
    end
  rescue LoadError
    # RubyGems not available
  end
else
  begin
    require 'minitest/unit'
  rescue LoadError
    # MiniTest not available
  end
end

if defined?(MiniTest)
  require 'mocha/mini_test_adapter'

  module MiniTest
    class Unit
      class TestCase
        include Mocha::Standalone
        include Mocha::MiniTestCaseAdapter
      end
    end
  end
end

require 'mocha/test_case_adapter'
require 'test/unit/testcase'

unless Test::Unit::TestCase.ancestors.include?(Mocha::Standalone)
  module Test
    module Unit
      class TestCase
        include Mocha::Standalone
        include Mocha::TestCaseAdapter
      end
    end
  end
end
