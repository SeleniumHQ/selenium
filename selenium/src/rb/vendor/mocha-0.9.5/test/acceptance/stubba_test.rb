require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'deprecation_disabler'

class StubbaTest < Test::Unit::TestCase

  include DeprecationDisabler

  def test_should_report_deprecation_of_stubba_which_will_be_removed_in_a_future_release
    disable_deprecations do
      load 'stubba.rb'
    end
    assert_equal ["require 'stubba' is no longer needed and stubba.rb will soon be removed"], Mocha::Deprecation.messages
  end

end
