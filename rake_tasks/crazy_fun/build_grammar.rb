# line 1 "rake-tasks/crazy_fun/build_grammar.rl"

class BuildFile
# line 73 "rake-tasks/crazy_fun/build_grammar.rl"
	def parse(data)
    # line 12 "rake-tasks/crazy_fun/build_grammar.rb"
    class << self
      attr_accessor :_build_grammar_trans_keys
      private :_build_grammar_trans_keys, :_build_grammar_trans_keys=
    end

    self._build_grammar_trans_keys = [
      0, 0, 9, 122, 10, 13,
      40, 122, 9, 122, 9,
      122, 9, 122, 9, 61,
      9, 91, 34, 34, 9, 44,
      10, 13, 9, 123, 34,
      34, 9, 93, 9, 123,
      9, 44, 9, 34, 34, 34,
      9, 58, 9, 34, 34,
      34, 9, 125, 9, 125,
      9, 93, 9, 122, 9, 122,
      0
    ]

    class << self
      attr_accessor :_build_grammar_key_spans
      private :_build_grammar_key_spans, :_build_grammar_key_spans=
    end

    self._build_grammar_key_spans = [
      0, 114, 4, 83, 114, 114, 114, 53,
      83, 1, 36, 4, 115, 1, 85, 115,
      36, 26, 1, 50, 26, 1, 117, 117,
      85, 114, 114
    ]

    class << self
      attr_accessor :_build_grammar_index_offsets
      private :_build_grammar_index_offsets, :_build_grammar_index_offsets=
    end

    self._build_grammar_index_offsets = [
      0, 0, 115, 120, 204, 319, 434, 549,
      603, 687, 689, 726, 731, 847, 849, 935,
      1051, 1088, 1115, 1117, 1168, 1195, 1197, 1315,
      1433, 1519, 1634
    ]

    class << self
      attr_accessor :_build_grammar_indicies
      private :_build_grammar_indicies, :_build_grammar_indicies=
    end

    self._build_grammar_indicies = [
      0, 0, 0, 0, 0, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 0,
      1, 1, 2, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      3, 3, 3, 3, 3, 3, 3, 3,
      3, 3, 3, 3, 3, 3, 3, 3,
      3, 3, 3, 3, 3, 3, 3, 3,
      3, 3, 1, 0, 2, 2, 0, 2,
      4, 1, 1, 1, 1, 1, 1, 1,
      5, 5, 5, 5, 5, 5, 5, 5,
      5, 5, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 5,
      1, 5, 5, 5, 5, 5, 5, 5,
      5, 5, 5, 5, 5, 5, 5, 5,
      5, 5, 5, 5, 5, 5, 5, 5,
      5, 5, 5, 1, 6, 6, 6, 6,
      6, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 6, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 7, 7, 7, 7,
      7, 7, 7, 7, 7, 7, 7, 7,
      7, 7, 7, 7, 7, 7, 7, 7,
      7, 7, 7, 7, 7, 7, 1, 8,
      8, 8, 8, 8, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 8, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 9,
      9, 9, 9, 9, 9, 9, 9, 9,
      9, 9, 9, 9, 9, 9, 9, 9,
      9, 9, 9, 9, 9, 9, 9, 9,
      9, 1, 10, 10, 10, 10, 10, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 10, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 11, 11, 11, 11, 11, 11, 11,
      11, 11, 11, 1, 1, 1, 12, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      11, 1, 11, 11, 11, 11, 11, 11,
      11, 11, 11, 11, 11, 11, 11, 11,
      11, 11, 11, 11, 11, 11, 11, 11,
      11, 11, 11, 11, 1, 13, 13, 13,
      13, 13, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 13, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 14, 1, 14, 14, 14, 14, 14,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 14, 1, 15, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 16, 1, 18,
      17, 19, 19, 19, 19, 19, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      19, 1, 1, 1, 1, 1, 1, 1,
      1, 20, 1, 1, 4, 1, 22, 21,
      21, 22, 21, 23, 23, 23, 23, 23,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 23, 1, 24, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 25, 1, 27,
      26, 28, 28, 28, 28, 28, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      28, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 29, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 30, 1, 29,
      29, 29, 29, 29, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 29, 1,
      24, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 30, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 25, 1, 18, 18, 18, 18, 18,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 18, 1, 1, 1, 1, 1,
      1, 1, 1, 20, 1, 1, 4, 1,
      31, 31, 31, 31, 31, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 31,
      1, 32, 1, 34, 33, 35, 35, 35,
      35, 35, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 35, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 36, 1,
      36, 36, 36, 36, 36, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 36,
      1, 37, 1, 39, 38, 40, 40, 40,
      40, 40, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 40, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      41, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 42, 1, 43, 43, 43, 43, 43,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 43, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 31, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 44,
      1, 27, 27, 27, 27, 27, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      27, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 45, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 46, 1, 47,
      47, 47, 47, 47, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 47, 1,
      1, 48, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 49,
      49, 49, 49, 49, 49, 49, 49, 49,
      49, 49, 49, 49, 49, 49, 49, 49,
      49, 49, 49, 49, 49, 49, 49, 49,
      49, 1, 22, 22, 22, 22, 22, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 22, 1, 1, 21, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 3, 3, 3, 3, 3, 3,
      3, 3, 3, 3, 3, 3, 3, 3,
      3, 3, 3, 3, 3, 3, 3, 3,
      3, 3, 3, 3, 1, 0
    ]

    class << self
      attr_accessor :_build_grammar_trans_targs
      private :_build_grammar_trans_targs, :_build_grammar_trans_targs=
    end

    self._build_grammar_trans_targs = [
      1, 0, 2, 3, 4, 3, 5, 6,
      5, 6, 7, 6, 8, 7, 8, 9,
      12, 9, 10, 10, 25, 11, 26, 12,
      13, 17, 13, 14, 14, 15, 16, 17,
      18, 18, 19, 19, 20, 21, 21, 22,
      23, 17, 24, 23, 24, 15, 16, 26,
      11, 3
    ]

    class << self
      attr_accessor :_build_grammar_trans_actions
      private :_build_grammar_trans_actions, :_build_grammar_trans_actions=
    end

    self._build_grammar_trans_actions = [
      0, 0, 0, 1, 2, 3, 4, 5,
      0, 6, 2, 3, 2, 0, 0, 7,
      8, 3, 2, 0, 9, 0, 10, 0,
      7, 11, 3, 2, 0, 0, 0, 0,
      12, 3, 2, 0, 0, 7, 3, 2,
      2, 2, 2, 0, 0, 2, 2, 9,
      2, 13
    ]

    class << self
      attr_accessor :_build_grammar_eof_actions
      private :_build_grammar_eof_actions, :_build_grammar_eof_actions=
    end

    self._build_grammar_eof_actions = [
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 2, 0
    ]

    class << self
      attr_accessor :build_grammar_start
    end

    self.build_grammar_start = 1

    class << self
      attr_accessor :build_grammar_first_final
    end

    self.build_grammar_first_final = 25

    class << self
      attr_accessor :build_grammar_error
    end

    self.build_grammar_error = 0

    class << self
      attr_accessor :build_grammar_en_main
    end

    self.build_grammar_en_main = 1

    # line 77 "rake-tasks/crazy_fun/build_grammar.rl"
    @data = data
    @data = @data.unpack("c*") if @data.is_a?(String)
    # line 343 "rake-tasks/crazy_fun/build_grammar.rb"
    begin
      @p ||= 0
      pe ||=  @data.length
      cs = build_grammar_start
    end

    # line 82 "rake-tasks/crazy_fun/build_grammar.rl"

    begin
    # line 354 "rake-tasks/crazy_fun/build_grammar.rb"
      begin
        testEof = false
        _slen, _trans, _keys, _inds, _acts, _nacts = nil
        _goto_level = 0
        _resume = 10
        _eof_trans = 15
        _again = 20
        _test_eof = 30
        _out = 40
        while true
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
            _keys = cs << 1
            _inds = _build_grammar_index_offsets[cs]
            _slen = _build_grammar_key_spans[cs]
            _trans =
              if (_slen > 0 && _build_grammar_trans_keys[_keys] <= @data[ @p] && @data[ @p] <= _build_grammar_trans_keys[_keys + 1])
                _build_grammar_indicies[ _inds +  @data[ @p] - _build_grammar_trans_keys[_keys] ]
              else
                _build_grammar_indicies[ _inds + _slen ]
              end
            cs = _build_grammar_trans_targs[_trans]
            if _build_grammar_trans_actions[_trans] != 0
              case _build_grammar_trans_actions[_trans]
              when 4
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
              when 8
                # line 23 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  puts "Starting array" if @debug
                  @lhs.push ArrayType.new
                end
              # line 23 "rake-tasks/crazy_fun/build_grammar.rl"
              when 11
                # line 27 "rake-tasks/crazy_fun/build_grammar.rl"
                begin

                puts "Starting map" if @debug
                @lhs.push MapType.new
                end
              # line 27 "rake-tasks/crazy_fun/build_grammar.rl"
              when 7
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
              # line 35 "rake-tasks/crazy_fun/build_grammar.rl"
              when 10
                # line 56 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  while (!@lhs.empty?)
                    leave
                  end
                end
              # line 56 "rake-tasks/crazy_fun/build_grammar.rl"
              when 3
                # line 67 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  @lhs[-1] << @data[@p].chr
                end
              # line 67 "rake-tasks/crazy_fun/build_grammar.rl"
              when 2
                # line 68 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  leave
                end
              # line 68 "rake-tasks/crazy_fun/build_grammar.rl"
              when 6
                # line 19 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  puts "Starting arg name" if @debug
                  @lhs.push SymbolType.new
                end
                # line 19 "rake-tasks/crazy_fun/build_grammar.rl"
                # line 67 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  @lhs[-1] << @data[@p].chr
                end
              # line 67 "rake-tasks/crazy_fun/build_grammar.rl"
              when 12
                # line 31 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  puts "Starting map entry" if @debug
                  @lhs.push MapEntry.new
                end
                # line 31 "rake-tasks/crazy_fun/build_grammar.rl"
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
              # line 35 "rake-tasks/crazy_fun/build_grammar.rl"
              when 9
                # line 68 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  leave
                end
                # line 68 "rake-tasks/crazy_fun/build_grammar.rl"
                # line 56 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  while (!@lhs.empty?)
                    leave
                  end
                end
              # line 56 "rake-tasks/crazy_fun/build_grammar.rl"
              when 5
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
                # line 19 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  puts "Starting arg name" if @debug
                  @lhs.push SymbolType.new
                end
                # line 19 "rake-tasks/crazy_fun/build_grammar.rl"
                # line 67 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  @lhs[-1] << @data[@p].chr
                end
              # line 67 "rake-tasks/crazy_fun/build_grammar.rl"
              when 1
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
                # line 45 "rake-tasks/crazy_fun/build_grammar.rl"
                # line 62 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  puts "Starting type name" if @debug
                  @lhs.push NameType.new
                end
                # line 62 "rake-tasks/crazy_fun/build_grammar.rl"
                # line 67 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  @lhs[-1] << @data[@p].chr
                end
              # line 67 "rake-tasks/crazy_fun/build_grammar.rl"
              when 13
                # line 68 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  leave
                end
                # line 68 "rake-tasks/crazy_fun/build_grammar.rl"
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
                # line 45 "rake-tasks/crazy_fun/build_grammar.rl"
                # line 62 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  puts "Starting type name" if @debug
                  @lhs.push NameType.new
                end
                # line 62 "rake-tasks/crazy_fun/build_grammar.rl"
                # line 67 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  @lhs[-1] << @data[@p].chr
                end
                # line 67 "rake-tasks/crazy_fun/build_grammar.rl"
                # line 582 "rake-tasks/crazy_fun/build_grammar.rb"
              end

              # THIS IS THE END OF THE HUMONGOUS CASE STATEMENT - Luke - Sep 2019
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
              case _build_grammar_eof_actions[cs]
              when 2
                # line 68 "rake-tasks/crazy_fun/build_grammar.rl"
                begin
                  leave
                end
                # line 68 "rake-tasks/crazy_fun/build_grammar.rl"
                # line 607 "rake-tasks/crazy_fun/build_grammar.rb"
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
