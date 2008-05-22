module Mocha

  class ExpectationError < StandardError
    
    LIB_DIRECTORY = File.expand_path(File.join(File.dirname(__FILE__), "..")) + File::SEPARATOR
    
    def initialize(message = nil, backtrace = [], lib_directory = LIB_DIRECTORY)
      super(message)
      filtered_backtrace = backtrace.reject { |location| Regexp.new(lib_directory).match(File.expand_path(location)) }
      set_backtrace(filtered_backtrace)
    end

  end
  
end