module Rake
  class Task
    attr_accessor :deps

    def out
      puts "We are reading the @out value currently!!! It is currently set to #{@out}"
      puts self.inspect
      @out
    end

    def out=(value)
      puts "We are WRITING the @out value currently!!! WE ARE WRITING IT TO #{value}"
      puts self.inspect
      @out = value
    end
  end
end
