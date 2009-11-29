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
      if method_exists?(method)
        begin
          stubbee.send(:alias_method, hidden_method, method)
        rescue NameError
          # deal with nasties like ActiveRecord::Associations::AssociationProxy
        end
      end
    end

    def define_new_method
      stubbee.class_eval("def #{method}(*args, &block); self.class.any_instance.mocha.method_missing(:#{method}, *args, &block); end", __FILE__, __LINE__)
    end

    def remove_new_method
      stubbee.send(:remove_method, method)
    end

    def restore_original_method
      if method_exists?(hidden_method)
        begin
          stubbee.send(:alias_method, method, hidden_method)
          stubbee.send(:remove_method, hidden_method)
        rescue NameError
          # deal with nasties like ActiveRecord::Associations::AssociationProxy
        end
      end
    end

    def method_exists?(method)
      return true if stubbee.public_instance_methods(false).include?(method)
      return true if stubbee.protected_instance_methods(false).include?(method)
      return true if stubbee.private_instance_methods(false).include?(method)
      return false
    end
    
  end
  
end