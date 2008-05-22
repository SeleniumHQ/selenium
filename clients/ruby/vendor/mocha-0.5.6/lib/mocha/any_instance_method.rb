require 'mocha/class_method'

module Mocha

  class AnyInstanceMethod < ClassMethod
  
    def unstub
      remove_new_method
      restore_original_method
      stubbee.any_instance.reset_mocha
    end
    
    def mock
      stubbee.any_instance.mocha
    end
   
    def hide_original_method
      stubbee.class_eval "alias_method :#{hidden_method}, :#{method}" if stubbee.method_defined?(method)
    end

    def define_new_method
      stubbee.class_eval "def #{method}(*args, &block); self.class.any_instance.mocha.method_missing(:#{method}, *args, &block); end"
    end

    def remove_new_method
      stubbee.class_eval "remove_method :#{method}"
    end

    def restore_original_method
      stubbee.class_eval "alias_method :#{method}, :#{hidden_method}; remove_method :#{hidden_method}" if stubbee.method_defined?(hidden_method)
    end

  end
  
end