require 'htree/modules'
require 'htree/raw_string'
require 'htree/htmlinfo'
require 'htree/encoder'
require 'htree/fstr'
require 'iconv'

module HTree
  class Text
    # :stopdoc:
    class << self
      alias new_internal new
    end
    # :startdoc:

    def Text.new(arg)
      arg = arg.to_node if HTree::Location === arg
      if Text === arg
        new_internal arg.rcdata, arg.normalized_rcdata
      elsif String === arg
        arg2 = arg.gsub(/&/, '&amp;')
        arg = arg2.freeze if arg != arg2
        new_internal arg
      else
        raise TypeError, "cannot initialize Text with #{arg.inspect}"
      end
    end

    def initialize(rcdata, normalized_rcdata=internal_normalize(rcdata)) # :notnew:
      init_raw_string
      @rcdata = rcdata && HTree.frozen_string(rcdata)
      @normalized_rcdata = @rcdata == normalized_rcdata ? @rcdata : normalized_rcdata
    end
    attr_reader :rcdata, :normalized_rcdata

    def internal_normalize(rcdata)
      # - character references are decoded as much as possible.
      # - undecodable character references are converted to decimal numeric character refereces.
      result = rcdata.gsub(/&(?:#([0-9]+)|#x([0-9a-fA-F]+)|([A-Za-z][A-Za-z0-9]*));/o) {|s|
        u = nil
        if $1
          u = $1.to_i
        elsif $2
          u = $2.hex
        elsif $3
          u = NamedCharacters[$3]
        end
        if !u || u < 0 || 0x7fffffff < u
          '?'
        elsif u == 38 # '&' character.
          '&#38;'
        elsif u <= 0x7f
          [u].pack("C")
        else
          begin
            Iconv.conv(Encoder.internal_charset, 'UTF-8', [u].pack("U"))
          rescue Iconv::Failure
            "&##{u};"
          end
        end
      }
      HTree.frozen_string(result)
    end
    private :internal_normalize

    # HTree::Text#to_s converts the text to a string.
    # - character references are decoded as much as possible.
    # - undecodable character reference are converted to `?' character.
    def to_s
      @normalized_rcdata.gsub(/&(?:#([0-9]+));/o) {|s|
        u = $1.to_i
        if 0 <= u && u <= 0x7f
          [u].pack("C")
        else
          '?'
        end
      }
    end

    def empty?
      @normalized_rcdata.empty?
    end

    def strip
      rcdata = @normalized_rcdata.dup
      rcdata.sub!(/\A(?:\s|&nbsp;)+/, '')
      rcdata.sub!(/(?:\s|&nbsp;)+\z/, '')
      if rcdata == @normalized_rcdata
        self
      else
        rcdata.freeze
        Text.new_internal(rcdata, rcdata)
      end
    end

    # HTree::Text.concat returns a text which is concatenation of arguments.
    #
    # An argument should be one of follows.
    # - String
    # - HTree::Text
    # - HTree::Location which points HTree::Text
    def Text.concat(*args)
      rcdata = ''
      args.each {|arg|
        arg = arg.to_node if HTree::Location === arg
        if Text === arg
          rcdata << arg.rcdata
        else
          rcdata << arg.gsub(/&/, '&amp;')
        end
      }
      new_internal rcdata
    end
  end
end
