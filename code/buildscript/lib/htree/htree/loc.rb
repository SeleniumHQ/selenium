require 'htree/modules'
require 'htree/elem'
require 'htree/inspect'

module HTree
  module Node
    # creates a location object which points to self.
    def make_loc
      self.class::Loc.new(nil, nil, self)
    end

    # return self.
    def to_node
      self
    end

    # +subst+ substitutes several subtrees at once.
    #
    #   t = HTree('<r><x/><y/><z/></r>')
    #   l = t.make_loc
    #   t2 = t.subst({
    #     l.get_subnode(0, 'k') => 'v',
    #     l.get_subnode(0, -1) => HTree('<a/>'),
    #     l.get_subnode(0, 1) => nil,
    #     l.get_subnode(0, 2, 0) => HTree('<b/>'),
    #   })
    #   pp t2
    #   # =>
    #   #<HTree::Doc
    #    {elem <r k="v"> {emptyelem <a>} {emptyelem <x>} {elem <z> {emptyelem <b>}}}>
    def subst(pairs)
      pairs = pairs.map {|key, val|
        key = key.index_list(self)
        unless Array === val
          val = [val]
        end
        [key, val]
      }

      pairs_empty_key, pairs_nonempty_key =
        pairs.partition {|key, val| key.empty? }
      if !pairs_empty_key.empty?
        if !pairs_nonempty_key.empty?
          raise ArgumentError, "cannot substitute a node under substituting tree."
        end
        result = []
        pairs_empty_key.each {|key, val| result.concat val }
        result.compact!
        if result.length == 1
          return result[0]
        else
          raise ArgumentError, "cannot substitute top node by multiple nodes: #{nodes.inspect}"
        end
      end
      if pairs_nonempty_key.empty?
        return self
      end

      subst_internal(pairs)
    end

    def subst_internal(pairs) # :nodoc:
      subnode_pairs = {}
      pairs.each {|key, val|
        k = key.pop
        (subnode_pairs[k] ||= []) << [key, val]
      }
      subnode_pairs = subnode_pairs.map {|k, subpairs|
        s = get_subnode(k)
        subpairs_empty_key, subpairs_nonempty_key =
          subpairs.partition {|key, val| key.empty? }
        if !subpairs_empty_key.empty?
          if !subpairs_nonempty_key.empty?
            raise ArgumentError, "cannot substitute a node under substituting tree."
          end
          r = []
          subpairs_empty_key.each {|key, val| r.concat val }
          [k, r.compact]
        elsif subpairs_nonempty_key.empty?
          [k, s]
        else
          [k, s.subst_internal(subpairs)]
        end
      }
      subst_subnode(subnode_pairs)
    end
  end

  # :stopdoc:
  class Doc; def node_test_string() 'doc()' end end
  class Elem; def node_test_string() @stag.element_name.qualified_name end end
  class Text; def node_test_string() 'text()' end end
  class BogusETag; def node_test_string() 'bogus-etag()' end end
  class XMLDecl; def node_test_string() 'xml-declaration()' end end
  class DocType; def node_test_string() 'doctype()' end end
  class ProcIns; def node_test_string() 'processing-instruction()' end end
  class Comment; def node_test_string() 'comment()' end end

  module Container
    def find_loc_step(index)
      if index < 0 || @children.length <= index
        return "*[#{index}]"
      end

      return @loc_step_children[index].dup if defined? @loc_step_children

      count = {}
      count.default = 0

      steps = []

      @children.each {|c|
        node_test = c.node_test_string
        count[node_test] += 1
        steps << [node_test, count[node_test]]
      }

      @loc_step_children = []
      steps.each {|node_test, i|
        if count[node_test] == 1
          @loc_step_children << node_test
        else
          @loc_step_children << "#{node_test}[#{i}]"
        end
      }

      return @loc_step_children[index].dup
    end
  end

  class Elem
    def find_loc_step(index)
      return super if Integer === index
      if String === index
        index = Name.parse_attribute_name(index, DefaultContext)
      end
      unless Name === index
        raise TypeError, "invalid index: #{index.inspect}"
      end
      "@#{index.qualified_name}"
    end
  end
  # :startdoc:
end

class HTree::Location
  def initialize(parent, index, node) # :nodoc:
    if parent
      @parent = parent
      @index = index
      @node = parent.node.get_subnode(index)
      if !@node.equal?(node)
        raise ArgumentError, "unexpected node"
      end
    else
      @parent = nil
      @index = nil
      @node = node
    end
    if @node && self.class != @node.class::Loc
      raise ArgumentError, "invalid location class: #{self.class} should be #{node.class::Loc}"
    end
    @subloc = {}
  end
  attr_reader :parent, :index, :node
  alias to_node node

  # return self.
  def make_loc
    self
  end

  # +top+ returns the originator location.
  #
  #   t = HTree('<a><b><c><d>')
  #   l = t.make_loc.get_subnode(0, 0, 0, 0)
  #   p l, l.top
  #   # =>
  #   #<HTree::Location: doc()/a/b/c/d>
  #   #<HTree::Location: doc()>
  def top
    result = self
    while result.parent
      result = result.parent
    end
    result
  end

  # +subst_itself+ substitutes the node pointed by the location.
  # It returns the location of substituted node.
  #
  #  t1 = HTree('<a><b><c><d>')
  #  p t1
  #  l1 = t1.make_loc.get_subnode(0, 0, 0, 0)
  #  p l1
  #  l2 = l1.subst_itself(HTree('<z/>'))
  #  p l2
  #  t2 = l2.top.to_node
  #  p t2
  #  # =>
  #  #<HTree::Doc {elem <a> {elem <b> {elem <c> {emptyelem <d>}}}}>
  #  #<HTree::Location: doc()/a/b/c/d>
  #  #<HTree::Location: doc()/a/b/c/z>
  #  #<HTree::Doc {elem <a> {elem <b> {elem <c> {emptyelem <z>}}}}>
  #
  def subst_itself(node)
    if @parent
      new_index = @index
      if !@node
        if Integer === @index
          if @index < 0
            new_index = 0
          elsif @parent.to_node.children.length < @index
            new_index = @parent.to_node.children.length
          end
        end
      end
      @parent.subst_itself(@parent.to_node.subst_subnode({@index=>node})).get_subnode(new_index)
    else
      node.make_loc
    end
  end

  # +subst+ substitutes several subtrees at once.
  #
  #   t = HTree('<r><x/><y/><z/></r>')
  #   l = t.make_loc
  #   l2 = l.subst({
  #     l.root.get_subnode('k') => 'v',
  #     l.root.get_subnode(-1) => HTree('<a/>'),
  #     l.find_element('y') => nil,
  #     l.find_element('z').get_subnode(0) => HTree('<b/>'),
  #   })
  #   pp l2, l2.to_node
  #   # =>
  #   #<HTree::Doc::Loc: doc()>
  #   #<HTree::Doc
  #    {elem <r k="v"> {emptyelem <a>} {emptyelem <x>} {elem <z> {emptyelem <b>}}}>
  def subst(pairs)
    subst_itself(@node.subst(pairs))
  end

  # +loc_list+ returns an array containing from location's root to itself.
  #
  #   t = HTree('<a><b><c>')
  #   l = t.make_loc.get_subnode(0, 0, 0)
  #   pp l, l.loc_list
  #   # =>
  #   #<HTree::Location: doc()/a/b/c>
  #   [#<HTree::Location: doc()>,
  #    #<HTree::Location: doc()/a>,
  #    #<HTree::Location: doc()/a/b>,
  #    #<HTree::Location: doc()/a/b/c>]
  #
  def loc_list
    loc = self
    result = [self]
    while loc = loc.parent
      result << loc
    end
    result.reverse!
    result
  end

  # +path+ returns the path of the location.
  #
  #   l = HTree.parse("<a><b>x</b><b/><a/>").make_loc
  #   l = l.get_subnode(0, 0, 0)
  #   p l.path # => "doc()/a/b[1]/text()"
  def path
    result = ''
    loc_list.each {|loc|
      if parent = loc.parent
        result << '/' << parent.node.find_loc_step(loc.index)
      else
        result << loc.node.node_test_string
      end
    }
    result
  end

  def index_list(node) # :nodoc:
    result = []
    loc = self
    while parent = loc.parent
      return result if loc.to_node.equal? node
      result << loc.index
      loc = parent
    end
    return result if loc.to_node.equal? node
    raise ArgumentError, "the location is not under the node: #{self.path}"
  end

  # :stopdoc:
  def pretty_print(q)
    q.group(1, "#<#{self.class.name}", '>') {
      q.text ':'
      q.breakable
      loc_list.each {|loc|
        if parent = loc.parent
          q.text '/'
          q.group { q.breakable '' }
          q.text parent.node.find_loc_step(loc.index)
        else
          q.text loc.node.node_test_string
        end
      }
    }
  end
  alias inspect pretty_print_inspect
  # :startdoc:
end

module HTree::Container::Loc
  # +get_subnode+ returns a location object which points to a subnode
  # indexed by _index_. 
  def get_subnode_internal(index) # :nodoc:
    return @subloc[index] if @subloc.include? index
    node = @node.get_subnode(index)
    if node
      @subloc[index] = node.class::Loc.new(self, index, node)
    else
      @subloc[index] = HTree::Location.new(self, index, node)
    end
  end

  # +subst_subnode+ returns the location which refers the substituted tree.
  #   loc.subst_subnode(pairs) -> loc
  #
  #   t = HTree('<a><b><c>')
  #   l = t.make_loc.get_subnode(0, 0)
  #   l = l.subst_subnode({0=>HTree('<z/>')})
  #   pp t, l.top.to_node
  #   # =>
  #   #<HTree::Doc {elem <a> {elem <b> {emptyelem <c>}}}>
  #   #<HTree::Doc {elem <a> {elem <b> {emptyelem <z>}}}>
  #
  def subst_subnode(pairs)
    self.subst_itself(@node.subst_subnode(pairs))
  end

  # +children+ returns an array of child locations.
  def children
    (0...@node.children.length).map {|i| get_subnode(i) }
  end
end

class HTree::Elem::Loc
  def context() @node.context end

  # +element_name+ returns the name of the element name as a Name object.
  def element_name() @node.element_name end

  def empty_element?() @node.empty_element? end

  # +each_attribute+ iterates over each attributes.
  def each_attribute
    @node.each_attribute {|attr_name, attr_text|
      attr_loc = get_subnode(attr_name)
      yield attr_name, attr_loc
    }
  end
end

class HTree::Text::Loc
  def to_s() @node.to_s end
  def strip() @node.strip end
  def empty?() @node.empty? end
end
