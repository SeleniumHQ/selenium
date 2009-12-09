require 'mocha/deprecation'

module DeprecationDisabler

  def disable_deprecations
    original_mode = Mocha::Deprecation.mode
    Mocha::Deprecation.mode = :disabled
    begin
      yield
    ensure
      Mocha::Deprecation.mode = original_mode
    end
  end

end