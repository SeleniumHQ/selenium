
# line 1 "rake-tasks/crazy_fun/build_grammar.rl"

class BuildFile
  
# line 73 "rake-tasks/crazy_fun/build_grammar.rl"

      
   def parse(data)
     
# line 12 "rake-tasks/crazy_fun/build_grammar.rb"
class << self
	attr_accessor :_build_grammar_actions
	private :_build_grammar_actions, :_build_grammar_actions=
end
self._build_grammar_actions = [
	0, 1, 0, 1, 2, 1, 3, 1, 
	5, 1, 7, 1, 9, 1, 10, 2, 
	1, 9, 2, 4, 5, 2, 10, 7, 
	3, 0, 1, 9, 3, 6, 8, 9, 
	4, 10, 6, 8, 9
]

class << self
	attr_accessor :_build_grammar_key_offsets
	private :_build_grammar_key_offsets, :_build_grammar_key_offsets=
end
self._build_grammar_key_offsets = [
	0, 0, 6, 8, 14, 19, 24, 33, 
	37, 42, 43, 48, 50, 55, 56, 61, 
	66, 70, 71, 75, 79, 80, 85, 90, 
	95, 101
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
	122, 32, 61, 9, 13, 32, 34, 91, 
	9, 13, 34, 32, 41, 44, 9, 13, 
	10, 13, 32, 34, 123, 9, 13, 34, 
	32, 44, 93, 9, 13, 32, 41, 44, 
	9, 13, 32, 34, 9, 13, 34, 32, 
	58, 9, 13, 32, 34, 9, 13, 34, 
	32, 44, 125, 9, 13, 32, 44, 125, 
	9, 13, 32, 44, 93, 9, 13, 32, 
	35, 9, 13, 97, 122, 32, 35, 9, 
	13, 97, 122, 0
]

class << self
	attr_accessor :_build_grammar_single_lengths
	private :_build_grammar_single_lengths, :_build_grammar_single_lengths=
end
self._build_grammar_single_lengths = [
	0, 2, 2, 2, 1, 1, 3, 2, 
	3, 1, 3, 2, 3, 1, 3, 3, 
	2, 1, 2, 2, 1, 3, 3, 3, 
	2, 2
]

class << self
	attr_accessor :_build_grammar_range_lengths
	private :_build_grammar_range_lengths, :_build_grammar_range_lengths=
end
self._build_grammar_range_lengths = [
	0, 2, 0, 2, 2, 2, 3, 1, 
	1, 0, 1, 0, 1, 0, 1, 1, 
	1, 0, 1, 1, 0, 1, 1, 1, 
	2, 2
]

class << self
	attr_accessor :_build_grammar_index_offsets
	private :_build_grammar_index_offsets, :_build_grammar_index_offsets=
end
self._build_grammar_index_offsets = [
	0, 0, 5, 8, 13, 17, 21, 28, 
	32, 37, 39, 44, 47, 52, 54, 59, 
	64, 68, 70, 74, 78, 80, 85, 90, 
	95, 100
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
	14, 15, 16, 14, 1, 18, 17, 19, 
	20, 4, 19, 1, 22, 22, 21, 23, 
	24, 25, 23, 1, 27, 26, 28, 23, 
	29, 28, 1, 18, 20, 4, 18, 1, 
	30, 31, 30, 1, 33, 32, 34, 35, 
	34, 1, 35, 36, 35, 1, 38, 37, 
	39, 40, 41, 39, 1, 42, 30, 43, 
	42, 1, 27, 44, 45, 27, 1, 46, 
	47, 46, 48, 1, 22, 21, 22, 3, 
	1, 0
]

class << self
	attr_accessor :_build_grammar_trans_targs
	private :_build_grammar_trans_targs, :_build_grammar_trans_targs=
end
self._build_grammar_trans_targs = [
	1, 0, 2, 3, 4, 3, 5, 6, 
	5, 6, 7, 6, 8, 7, 8, 9, 
	12, 9, 10, 10, 24, 11, 25, 12, 
	13, 16, 13, 14, 14, 15, 16, 17, 
	17, 18, 18, 19, 20, 20, 21, 22, 
	16, 23, 22, 23, 12, 15, 25, 11, 
	3
]

class << self
	attr_accessor :_build_grammar_trans_actions
	private :_build_grammar_trans_actions, :_build_grammar_trans_actions=
end
self._build_grammar_trans_actions = [
	0, 0, 0, 28, 13, 11, 1, 24, 
	0, 15, 13, 11, 13, 0, 0, 7, 
	3, 11, 13, 0, 21, 0, 9, 0, 
	7, 5, 11, 13, 0, 0, 0, 18, 
	11, 13, 0, 0, 7, 11, 13, 13, 
	13, 13, 0, 0, 13, 13, 21, 13, 
	32
]

class << self
	attr_accessor :_build_grammar_eof_actions
	private :_build_grammar_eof_actions, :_build_grammar_eof_actions=
end
self._build_grammar_eof_actions = [
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	0, 0, 0, 0, 0, 0, 0, 0, 
	13, 0
]

class << self
	attr_accessor :build_grammar_start
end
self.build_grammar_start = 1;
class << self
	attr_accessor :build_grammar_first_final
end
self.build_grammar_first_final = 24;
class << self
	attr_accessor :build_grammar_error
end
self.build_grammar_error = 0;

class << self
	attr_accessor :build_grammar_en_main
end
self.build_grammar_en_main = 1;


# line 77 "rake-tasks/crazy_fun/build_grammar.rl"

     @data = data
     @data = @data.unpack("c*") if @data.is_a?(String)

     
# line 175 "rake-tasks/crazy_fun/build_grammar.rb"
begin
	 @p ||= 0
	pe ||=  @data.length
	cs = build_grammar_start
end

# line 82 "rake-tasks/crazy_fun/build_grammar.rl"

     begin
       
# line 186 "rake-tasks/crazy_fun/build_grammar.rb"
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
when 1 then
# line 19 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 
        puts "Starting arg name" if @debug
        @lhs.push SymbolType.new 
      		end
when 2 then
# line 23 "rake-tasks/crazy_fun/build_grammar.rl"
		begin

       puts "Starting array" if @debug
       @lhs.push ArrayType.new 
     		end
when 3 then
# line 27 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 
       puts "Starting map" if @debug
       @lhs.push MapType.new 
     		end
when 4 then
# line 31 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 
       puts "Starting map entry" if @debug
       @lhs.push MapEntry.new 
     		end
when 5 then
# line 35 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 
       if @data[@p + 1].chr == ':'
         puts "Starting symbol" if @debug
         @lhs.push SymbolType.new
         @p = @p + 1
       else
         puts "Starting string" if @debug
         @lhs.push StringType.new 
       end
     		end
when 6 then
# line 45 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 
       puts "Starting type" if @debug
       # Unwind the stack until the top is another OutputType (or it's empty)
       while (!@lhs.empty?)
         puts "Unwinding [#{@lhs}]" + @lhs.length.to_s
         leave
       end
       
       @lhs.push OutputType.new 
     		end
when 7 then
# line 56 "rake-tasks/crazy_fun/build_grammar.rl"
		begin

       while (!@lhs.empty?)
          leave
        end
     		end
when 8 then
# line 62 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 
       puts "Starting type name" if @debug
       @lhs.push NameType.new 
     		end
when 9 then
# line 67 "rake-tasks/crazy_fun/build_grammar.rl"
		begin
 @lhs[-1] << @data[@p].chr 		end
when 10 then
# line 68 "rake-tasks/crazy_fun/build_grammar.rl"
		begin

       leave
     		end
# line 358 "rake-tasks/crazy_fun/build_grammar.rb"
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
when 10 then
# line 68 "rake-tasks/crazy_fun/build_grammar.rl"
		begin

       leave
     		end
# line 392 "rake-tasks/crazy_fun/build_grammar.rb"
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

# line 85 "rake-tasks/crazy_fun/build_grammar.rl"
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
