module Mocha # :nodoc:
  
  # Configuration settings
  class Configuration
    
    DEFAULTS = { :stubbing_method_unnecessarily => :allow, :stubbing_method_on_non_mock_object => :allow, :stubbing_non_existent_method => :allow, :stubbing_non_public_method => :allow }
    
    class << self
    
      # :call-seq: allow(action)
      #
      # Allow the specified <tt>action</tt> (as a symbol).
      # The <tt>actions</tt> currently available are <tt>:stubbing_method_unnecessarily, :stubbing_method_on_non_mock_object, :stubbing_non_existent_method, :stubbing_non_public_method</tt>.
      def allow(action)
        configuration[action] = :allow
      end
    
      def allow?(action) # :nodoc:
        configuration[action] == :allow
      end
    
      # :call-seq: warn_when(action)
      #
      # Warn if the specified <tt>action</tt> (as a symbol) is attempted.
      # The <tt>actions</tt> currently available are <tt>:stubbing_method_unnecessarily, :stubbing_method_on_non_mock_object, :stubbing_non_existent_method, :stubbing_non_public_method</tt>.
      def warn_when(action)
        configuration[action] = :warn
      end
    
      def warn_when?(action) # :nodoc:
        configuration[action] == :warn
      end
    
      # :call-seq: prevent(action)
      #
      # Raise a StubbingError if the specified <tt>action</tt> (as a symbol) is attempted.
      # The <tt>actions</tt> currently available are <tt>:stubbing_method_unnecessarily, :stubbing_method_on_non_mock_object, :stubbing_non_existent_method, :stubbing_non_public_method</tt>.
      def prevent(action)
        configuration[action] = :prevent
      end
    
      def prevent?(action) # :nodoc:
        configuration[action] == :prevent
      end
    
      def reset_configuration # :nodoc:
        @configuration = nil
      end
    
      private
    
      def configuration # :nodoc:
        @configuration ||= DEFAULTS.dup
      end
    
    end
    
  end
  
end