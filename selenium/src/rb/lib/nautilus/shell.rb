module Nautilus
  
  class Shell
    
    def run(command, options = {})
      sh build_command(command, options)
    end

    def build_command(command, options = {})
      actual_command = command.kind_of?(Array) ? command.join(" ") : command
      if options[:background]
        if windows?
          actual_command = "start /wait /b " + command
        elsif options[:background]
          actual_command << " &"
        end
      end      
      actual_command
    end
            
    def windows?
      RUBY_PLATFORM =~ /mswin/
    end
    
    def sh(command)
      successful = system(command)
      raise "Error while running >>#{command}<<" unless successful
    end
    
  end

end