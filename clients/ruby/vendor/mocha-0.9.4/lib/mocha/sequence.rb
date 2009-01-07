module Mocha # :nodoc:
  
  class Sequence
    
    class InSequenceOrderingConstraint
      
      def initialize(sequence, index)
        @sequence, @index = sequence, index
      end
      
      def allows_invocation_now?
        @sequence.satisfied_to_index?(@index)
      end
      
      def mocha_inspect
        "in sequence #{@sequence.mocha_inspect}"
      end
      
    end
    
    def initialize(name)
      @name = name
      @expectations = []
    end
    
    def constrain_as_next_in_sequence(expectation)
      index = @expectations.length
      @expectations << expectation
      expectation.add_ordering_constraint(InSequenceOrderingConstraint.new(self, index))
    end
    
    def satisfied_to_index?(index)
      @expectations[0...index].all? { |expectation| expectation.satisfied? }
    end
    
    def mocha_inspect
      "#{@name.mocha_inspect}"
    end
    
  end
  
end