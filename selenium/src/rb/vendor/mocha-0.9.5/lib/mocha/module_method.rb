require 'mocha/module_method'

module Mocha

  class ModuleMethod < ClassMethod

    def method_exists?(method)
      return true if stubbee.public_methods(false).include?(method)
      return true if stubbee.protected_methods(false).include?(method)
      return true if stubbee.private_methods(false).include?(method)
      return false
    end

  end
  
end