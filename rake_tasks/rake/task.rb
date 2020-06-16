module Rake
  class Task
    attr_accessor :deps

    def out
      if @debug
        puts "We are reading the @out value currently!!! It is currently set to #{@out}"
        puts self.inspect
      end
      @out
    end

    def out=(value)
      if @debug
        puts "We are WRITING the @out value currently!!! WE ARE WRITING IT TO #{value}"
        puts self.inspect
      end
      @out = value
    end
  end
end
