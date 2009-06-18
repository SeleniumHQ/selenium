class Enterprise

  def initialize(dilithium)
    @dilithium = dilithium
  end

  def go(warp_factor)
    warp_factor.times { @dilithium.nuke(:anti_matter) }
  end

end

require 'test/unit'
require 'rubygems'
require 'mocha'

class EnterpriseTest < Test::Unit::TestCase

  def test_should_boldly_go
    dilithium = mock()
    dilithium.expects(:nuke).with(:anti_matter).at_least_once  # auto-verified at end of test
    enterprise = Enterprise.new(dilithium)
    enterprise.go(2)
  end

end
