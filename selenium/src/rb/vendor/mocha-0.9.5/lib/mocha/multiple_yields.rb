module Mocha # :nodoc:
  
  class MultipleYields # :nodoc:
    
    attr_reader :parameter_groups
    
    def initialize(*parameter_groups)
      @parameter_groups = parameter_groups
    end
    
    def each
      @parameter_groups.each do |parameter_group|
        yield(parameter_group)
      end
    end
    
  end
  
end
    
