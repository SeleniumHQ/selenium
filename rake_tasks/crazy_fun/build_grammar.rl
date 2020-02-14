
class BuildFile
  %%{
     machine build_grammar;
     variable p @p;
     variable data @data;
     variable eof @eof;

     # I've not figured out the right place to pop the stack, so hack around it
     action start_arg { 
       # clear the stack
       while !@lhs[-1].is_a? OutputType
         leave
       end

       puts "Starting arg" if @debug
       @lhs.push ArgType.new
     }
     action start_arg_name { 
        puts "Starting arg name" if @debug
        @lhs.push SymbolType.new 
      }
     action start_array {
       puts "Starting array" if @debug
       @lhs.push ArrayType.new 
     }
     action start_map { 
       puts "Starting map" if @debug
       @lhs.push MapType.new 
     }     
     action start_map_entry { 
       puts "Starting map entry" if @debug
       @lhs.push MapEntry.new 
     }
     action start_string { 
       if @data[@p + 1].chr == ':'
         puts "Starting symbol" if @debug
         @lhs.push SymbolType.new
         @p = @p + 1
       else
         puts "Starting string" if @debug
         @lhs.push StringType.new 
       end
     }  
     action start_type { 
       puts "Starting type" if @debug
       # Unwind the stack until the top is another OutputType (or it's empty)
       while (!@lhs.empty?)
         puts "Unwinding [#{@lhs}]" + @lhs.length.to_s
         leave
       end
       
       @lhs.push OutputType.new 
     }     
     
     action done {
       while (!@lhs.empty?)
          leave
        end
     }
     
     action start_type_name { 
       puts "Starting type name" if @debug
       @lhs.push NameType.new 
     }  
     
     action track { @lhs[-1] << @data[@p].chr } 
     action leaving {
       leave
     }
     
     include build 'base_grammar.rl';
   }%%
      
   def parse(data)
     %% write data; 

     @data = data
     @data = @data.unpack("c*") if @data.is_a?(String)

     %% write init;

     begin
       %% write exec;
     rescue
       puts show_bad_line       
       throw $!
     end

    if cs == build_grammar_error
      throw show_bad_line
    end

    @types
  end
end
