
# line 1 "rake-tasks/crazy_fun/build_grammar.rl"

class BuildFile
  
# line 71 "rake-tasks/crazy_fun/build_grammar.rl"

      
   def parse(data)
     
# line 12 "rake-tasks/crazy_fun/build_grammar.rb"
class << self
	attr_accessor :_build_grammar_actions
	private :_build_grammar_actions, :_build_grammar_actions=
end
self._build_grammar_actions = [
	0, 1, 0, 1, 2, 1, 3, 1, 
	4, 1, 5, 1, 8, 1, 10, 1, 
	11, 2, 1, 10, 2, 4, 5, 2, 
	6, 10, 2, 11, 8, 3, 0, 1, 
	10, 3, 7, 9, 10, 4, 11, 7, 
	9, 10
]

class << self
	attr_accessor :_build_grammar_key_offsets
	private :_build_grammar_key_offsets, :_build_grammar_key_offsets=
end
self._build_grammar_key_offsets = [
	0, 0, 6, 8, 14, 19, 24, 33, 
	37, 43, 44, 49, 51, 53, 65, 71, 
	72, 77, 82, 84, 96, 101, 102, 106, 
	107, 112, 113, 118, 123, 128, 130, 142, 
	144, 155, 161
]

class << self
	attr_accessor :_build_grammar_trans_keys
	private :_build_grammar_trans_keys, :_build_grammar_trans_keys=
end
self._build_grammar_trans_keys = [
	32, 35, 9, 13, 97, 122, 10, 13, 
	40, 95, 48, 57, 97, 122, 32, 9, 
	13, 97, 122, 32, 9, 13, 97, 122, 
	32, 61, 95, 9, 13, 48, 57, 97, 
	122, 32, 61, 9, 13, 32, 34, 58, 
	91, 9, 13, 34, 32, 41, 44, 9, 
	13, 10, 13, 97, 122, 32, 41, 44, 
	95, 9, 13, 48, 57, 65, 90, 97, 
	122, 32, 34, 58, 123, 9, 13, 34, 
	32, 44, 93, 9, 13, 32, 41, 44, 
	9, 13, 97, 122, 32, 44, 93, 95, 
	9, 13, 48, 57, 65, 90, 97, 122, 
	32, 34, 58, 9, 13, 34, 32, 61, 
	9, 13, 62, 32, 34, 58, 9, 13, 
	34, 32, 44, 125, 9, 13, 32, 44, 
	125, 9, 13, 32, 44, 93, 9, 13, 
	97, 122, 32, 44, 95, 125, 9, 13, 
	48, 57, 65, 90, 97, 122, 97, 122, 
	32, 61, 95, 9, 13, 48, 57, 65, 
	90, 97, 122, 32, 35, 9, 13, 97, 
	122, 32, 35, 9, 13, 97, 122, 0
]

class << self
	attr_accessor :_build_grammar_single_lengths
	private :_build_grammar_single_lengths, :_build_grammar_single_lengths=
end
self._build_grammar_single_lengths = [
	0, 2, 2, 2, 1, 1, 3, 2, 
	4, 1, 3, 2, 0, 4, 4, 1, 
	3, 3, 0, 4, 3, 1, 2, 1, 
	3, 1, 3, 3, 3, 0, 4, 0, 
	3, 2, 2
]

class << self
	attr_accessor :_build_grammar_range_lengths
	private :_build_grammar_range_lengths, :_build_grammar_range_lengths=
end
self._build_grammar_range_lengths = [
	0, 2, 0, 2, 2, 2, 3, 1, 
	1, 0, 1, 0, 1, 4, 1, 0, 
	1, 1, 1, 4, 1, 0, 1, 0, 
	1, 0, 1, 1, 1, 1, 4, 1, 
	4, 2, 2
]

class << self
	attr_accessor :_build_grammar_index_offsets
	private :_build_grammar_index_offsets, :_build_grammar_index_offsets=
end
self._build_grammar_index_offsets = [
	0, 0, 5, 8, 13, 17, 21, 28, 
	32, 38, 40, 45, 48, 50, 59, 65, 
	67, 72, 77, 79, 88, 93, 95, 99, 
	101, 106, 108, 113, 118, 123, 125, 134, 
	136, 144, 149
]

class << self
	attr_accessor :_build_grammar_indicies
	private :_build_grammar_indicies, :_build_grammar_indicies=
end
self._build_grammar_indicies = [
	0, 2, 0, 3, 1, 0, 0, 2, 
	4, 5, 5, 5, 1, 6, 6, 7, 
	1, 8, 8, 9, 1, 10, 12, 11, 
	10, 11, 11, 1, 13, 14, 13, 1, 
	14, 15, 16, 17, 14, 1, 19, 18, 
	20, 21, 4, 20, 1, 23, 23, 22, 
	24, 1, 19, 21, 4, 25, 19, 25, 
	25, 25, 1, 26, 27, 28, 29, 26, 
	1, 31, 30, 32, 26, 33, 32, 1, 
	19, 21, 4, 19, 1, 34, 1, 31, 
	35, 37, 36, 31, 36, 36, 36, 1, 
	38, 39, 40, 38, 1, 42, 41, 43, 
	44, 43, 1, 45, 1, 45, 46, 47, 
	45, 1, 49, 48, 50, 51, 52, 50, 
	1, 53, 38, 54, 53, 1, 31, 35, 
	37, 31, 1, 55, 1, 50, 51, 56, 
	52, 50, 56, 56, 56, 1, 57, 1, 
	42, 59, 58, 42, 58, 58, 58, 1, 
	60, 61, 60, 62, 1, 23, 22, 23, 
	3, 1, 0
]

class << self
	attr_accessor :_build_grammar_trans_targs
	private :_build_grammar_trans_targs, :_build_grammar_trans_targs=
end
self._build_grammar_trans_targs = [
	1, 0, 2, 3, 4, 3, 5, 6, 
	5, 6, 7, 6, 8, 7, 8, 9, 
	12, 14, 9, 10, 10, 33, 11, 34, 
	13, 13, 14, 15, 18, 20, 15, 16, 
	16, 17, 19, 14, 19, 17, 20, 21, 
	31, 21, 22, 22, 23, 24, 25, 29, 
	25, 26, 27, 20, 28, 27, 28, 30, 
	30, 32, 32, 23, 34, 11, 3
]

class << self
	attr_accessor :_build_grammar_trans_actions
	private :_build_grammar_trans_actions, :_build_grammar_trans_actions=
end
self._build_grammar_trans_actions = [
	0, 0, 0, 33, 15, 13, 1, 29, 
	0, 17, 15, 13, 15, 0, 0, 9, 
	0, 3, 13, 15, 0, 26, 0, 11, 
	23, 13, 0, 9, 0, 5, 13, 15, 
	0, 0, 23, 15, 13, 15, 0, 20, 
	7, 13, 15, 0, 0, 0, 9, 0, 
	13, 15, 15, 15, 15, 0, 0, 23, 
	13, 23, 13, 15, 26, 15, 37
]

class << self
	attr_accessor :_build_grammar_eof_actions
	private :_build_grammar_eof_actions, :_build_grammar_eof_actions=
end
self._build_grammar_eof_actions = [
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 15, 0
]

class << self
	attr_accessor :build_grammar_start
end
self.build_grammar_start = 1;
class << self
	attr_accessor :build_grammar_first_final
end
self.build_grammar_first_final = 33;
class << self
	attr_accessor :build_grammar_error
end
self.build_grammar_error = 0;

class << self
	attr_accessor :build_grammar_en_main
end
self.build_grammar_en_main = 1;


# line 75 "rake-tasks/crazy_fun/build_grammar.rl"

     @data = data
     @data = @data.unpack("c*") if @data.is_a?(String)

     
# line 196 "rake-tasks/crazy_fun/build_grammar.rb"
begin
	 @p ||= 0
	pe ||=  @data.length
	cs = build_grammar_start
end

# line 80 "rake-tasks/crazy_fun/build_grammar.rl"

     begin
       
# line 207 "rake-tasks/crazy_fun/build_grammar.rb"
begin
	_klen, _trans, _keys, _acts, _nacts = nil
	_goto_level = 0
	_resume = 10
	_eof_trans = 15
	_again = 20
	_test_eof = 30
	_out = 40
	while true
	_trigger_goto = false
	if _goto_level <= 0
	if  @p == pe
		_goto_level = _test_eof
		next
	end
	if cs == 0
		_goto_level = _out
		next
	end
	end
	if _goto_level <= _resume
	_keys = _build_grammar_key_offsets[cs]
	_trans = _build_grammar_index_offsets[cs]
	_klen = _build_grammar_single_lengths[cs]
	_break_match = false
	
	begin
	  if _klen > 0
	     _lower = _keys
	     _upper = _keys + _klen - 1

	     loop do
	        break if _upper < _lower
	        _mid = _lower + ( (_upper - _lower) >> 1 )

	        if  @data[ @p] < _build_grammar_trans_keys[_mid]
	           _upper = _mid - 1
	        elsif  @data[ @p] > _build_grammar_trans_keys[_mid]
	           _lower = _mid + 1
	        else
	           _trans += (_mid - _keys)
	           _break_match = true
	           break
	        end
	     end # loop
	     break if _break_match
	     _keys += _klen
	     _trans += _klen
	  end
	  _klen = _build_grammar_range_lengths[cs]
	  if _klen > 0
	     _lower = _keys
	     _upper = _keys + (_klen << 1) - 2
	     loop do
	        break if _upper < _lower
	        _mid = _lower + (((_upper-_lower) >> 1) & ~1)
	        if  @data[ @p] < _build_grammar_trans_keys[_mid]
	          _upper = _mid - 2
	        elsif  @data[ @p] > _build_grammar_trans_keys[_mid+1]
	          _lower = _mid + 2
	        else
	          _trans += ((_mid - _keys) >> 1)
	          _break_match = true
	          break
	        end
	     end # loop
	     break if _break_match
	     _trans += _klen
	  end
	end while false
	_trans = _build_grammar_indicies[_trans]
	cs = _build_grammar_trans_targs[_trans]
	if _build_grammar_trans_actions[_trans] != 0
		_acts = _build_grammar_trans_actions[_trans]
		_nacts = _build_grammar_actions[_acts]
		_acts += 1
		while _nacts > 0
			_nacts -= 1
			_acts += 1
			case _build_grammar_actions[_acts - 1]
when 0 then
# line 10 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 
       # clear the stack
       while !@lhs[-1].is_a? OutputType
         leave
       end

       puts "Starting arg" if @debug
       @lhs.push ArgType.new
     		end
# line 10 "rake-tasks/crazy_fun/build_grammar.rl"
when 1 then
# line 19 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 
        puts "Starting arg name" if @debug
        @lhs.push SymbolType.new 
      		end
# line 19 "rake-tasks/crazy_fun/build_grammar.rl"
when 2 then
# line 23 "rake-tasks/crazy_fun/build_grammar.rl"
		begin

       puts "Starting array" if @debug
       @lhs.push ArrayType.new 
     		end
# line 23 "rake-tasks/crazy_fun/build_grammar.rl"
when 3 then
# line 27 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 
       puts "Starting map" if @debug
       @lhs.push MapType.new 
     		end
# line 27 "rake-tasks/crazy_fun/build_grammar.rl"
when 4 then
# line 31 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 
       puts "Starting map entry" if @debug
       @lhs.push MapEntry.new 
     		end
# line 31 "rake-tasks/crazy_fun/build_grammar.rl"
when 5 then
# line 35 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 
       puts "Starting string" if @debug
       @lhs.push StringType.new 
     		end
# line 35 "rake-tasks/crazy_fun/build_grammar.rl"
when 6 then
# line 39 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 
       puts "Starting symbol" if @debug
       @lhs.push SymbolType.new 
     		end
# line 39 "rake-tasks/crazy_fun/build_grammar.rl"
when 7 then
# line 43 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 
       puts "Starting type" if @debug
       # Unwind the stack until the top is another OutputType (or it's empty)
       while (!@lhs.empty?)
         puts "Unwinding [#{@lhs}]" + @lhs.length.to_s
         leave
       end
       
       @lhs.push OutputType.new 
     		end
# line 43 "rake-tasks/crazy_fun/build_grammar.rl"
when 8 then
# line 54 "rake-tasks/crazy_fun/build_grammar.rl"
		begin

       while (!@lhs.empty?)
          leave
        end
     		end
# line 54 "rake-tasks/crazy_fun/build_grammar.rl"
when 9 then
# line 60 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 
       puts "Starting type name" if @debug
       @lhs.push NameType.new 
     		end
# line 60 "rake-tasks/crazy_fun/build_grammar.rl"
when 10 then
# line 65 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 @lhs[-1] << @data[@p].chr 		end
# line 65 "rake-tasks/crazy_fun/build_grammar.rl"
when 11 then
# line 66 "rake-tasks/crazy_fun/build_grammar.rl"
		begin

       leave
     		end
# line 66 "rake-tasks/crazy_fun/build_grammar.rl"
# line 392 "rake-tasks/crazy_fun/build_grammar.rb"
			end # action switch
		end
	end
	if _trigger_goto
		next
	end
	end
	if _goto_level <= _again
	if cs == 0
		_goto_level = _out
		next
	end
	 @p += 1
	if  @p != pe
		_goto_level = _resume
		next
	end
	end
	if _goto_level <= _test_eof
	if  @p ==  @eof
	__acts = _build_grammar_eof_actions[cs]
	__nacts =  _build_grammar_actions[__acts]
	__acts += 1
	while __nacts > 0
		__nacts -= 1
		__acts += 1
		case _build_grammar_actions[__acts - 1]
when 11 then
# line 66 "rake-tasks/crazy_fun/build_grammar.rl"
		begin

       leave
     		end
# line 66 "rake-tasks/crazy_fun/build_grammar.rl"
# line 427 "rake-tasks/crazy_fun/build_grammar.rb"
		end # eof action switch
	end
	if _trigger_goto
		next
	end
end
	end
	if _goto_level <= _out
		break
	end
	end
	end

# line 83 "rake-tasks/crazy_fun/build_grammar.rl"
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
