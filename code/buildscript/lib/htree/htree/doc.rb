require 'htree/modules'
require 'htree/container'

module HTree
  class Doc
    # :stopdoc:
    class << self
      alias new! new
    end
    # :startdoc:

    # The arguments should be a sequence of follows.
    # [String object] specified string is converted to HTree::Text.
    # [HTree::Node object] used as a child.
    # [HTree::Doc object]
    #   used as children.
    #   It is expanded except HTree::XMLDecl and HTree::DocType objects.
    # [Array of String, HTree::Node and HTree::Doc] used as children.
    #
    def Doc.new(*args)
      children = []
      args.each {|arg|
        arg = arg.to_node if HTree::Location === arg
        case arg
        when Array
          arg.each {|a|
            a = a.to_node if HTree::Location === a
            case a
            when HTree::Doc
              children.concat(a.children.reject {|c|
                HTree::XMLDecl === c || HTree::DocType === c
              })
            when HTree::Node
              children << a
            when String
              children << Text.new(a)
            else
              raise TypeError, "unexpected argument: #{arg.inspect}"
            end
          }
        when HTree::Doc
          children.concat(arg.children.reject {|c|
            HTree::XMLDecl === c || HTree::DocType === c
          })
        when HTree::Node
          children << arg
        when String
          children << Text.new(arg)
        else
          raise TypeError, "unexpected argument: #{arg.inspect}"
        end
      }
      new!(children)
    end

    def initialize(children=[]) # :notnew:
      @children = children.dup.freeze
      unless @children.all? {|c| c.kind_of?(HTree::Node) and !c.kind_of?(HTree::Doc) }
        unacceptable = @children.reject {|c| c.kind_of?(HTree::Node) and !c.kind_of?(HTree::Doc) }
        unacceptable = unacceptable.map {|uc| uc.inspect }.join(', ')
        raise TypeError, "Unacceptable document child: #{unacceptable}"
      end
    end 

    def get_subnode_internal(index) # :nodoc:
      unless Integer === index
        raise TypeError, "invalid index: #{index.inspect}"
      end
      if index < 0 || @children.length <= index
        nil
      else
        @children[index]
      end
    end

    #   doc.subst_subnode(pairs) -> doc
    #
    # The argument _pairs_ should be a hash or an assocs.
    # Its key should be an integer which means an index for children.
    #
    # Its value should be one of follows.
    # [HTree::Node object] specified object is used as is.
    # [String object] specified string is converted to HTree::Text
    # [Array of above] specified HTree::Node and String is used in that order.
    # [nil] delete corresponding node.
    #
    #   d = HTree('<a/><b/><c/>')        
    #   p d.subst_subnode({0=>HTree('<x/>'), 2=>HTree('<z/>')})
    #   p d.subst_subnode([[0,HTree('<x/>')], [2,HTree('<z/>')]])
    #   # =>
    #   #<HTree::Doc {emptyelem <x>} {emptyelem <b>} {emptyelem <z>}>
    #   #<HTree::Doc {emptyelem <x>} {emptyelem <b>} {emptyelem <z>}>
    #
    def subst_subnode(pairs)
      hash = {}
      pairs.each {|index, value|
        unless Integer === index
          raise TypeError, "invalid index: #{index.inspect}"
        end
        value = value.to_node if HTree::Location === value
        case value
        when Node
          value = [value]
        when String
          value = [value]
        when Array
          value = value.dup
        when nil
          value = []
        else
          raise TypeError, "invalid value: #{value.inspect}"
        end
        value.map! {|v|
          v = v.to_node if HTree::Location === v
          case v
          when Node
            v
          when String
            Text.new(v)
          else
            raise TypeError, "invalid value: #{v.inspect}"
          end
        }
        if !hash.include?(index)
          hash[index] = []
        end
        hash[index].concat value
      }

      children_left = []
      children = @children.dup
      children_right = []

      hash.keys.sort.each {|index|
        value = hash[index]
        if index < 0
          children_left << value
        elsif children.length <= index
          children_right << value
        else
          children[index] = value
        end
      }

      children = [children_left, children, children_right].flatten.compact
      Doc.new(children)
    end
  end 
end
