require 'htree/doc'
require 'htree/elem'
require 'htree/loc'
require 'htree/extract_text'
require 'uri'

module HTree
  module Traverse
    def doc?() Doc::Trav === self end
    def elem?() Elem::Trav === self end
    def text?() Text::Trav === self end
    def xmldecl?() XMLDecl::Trav === self end
    def doctype?() DocType::Trav === self end
    def procins?() ProcIns::Trav === self end
    def comment?() Comment::Trav === self end
    def bogusetag?() BogusETag::Trav === self end

    def get_subnode(*indexes)
      n = self
      indexes.each {|index|
        n = n.get_subnode_internal(index)
      }
      n
    end
  end

  module Container::Trav
    # +each_child+ iterates over each child.
    def each_child(&block) # :yields: child_node
      children.each(&block)
      nil
    end

    # +each_child_with_index+ iterates over each child.
    def each_child_with_index(&block) # :yields: child_node, index
      children.each_with_index(&block)
      nil
    end

    # +find_element+ searches an element which universal name is specified by
    # the arguments. 
    # It returns nil if not found.
    def find_element(*names)
      traverse_element(*names) {|e| return e }
      nil
    end

    # +traverse_element+ traverses elements in the tree.
    # It yields elements in depth first order.
    #
    # If _names_ are empty, it yields all elements.
    # If non-empty _names_ are given, it should be list of universal names.
    # 
    # A nested element is yielded in depth first order as follows.
    #
    #   t = HTree('<a id=0><b><a id=1 /></b><c id=2 /></a>') 
    #   t.traverse_element("a", "c") {|e| p e}
    #   # =>
    #   {elem <a id="0"> {elem <b> {emptyelem <a id="1">} </b>} {emptyelem <c id="2">} </a>}
    #   {emptyelem <a id="1">}
    #   {emptyelem <c id="2">}
    #
    # Universal names are specified as follows.
    #
    #   t = HTree(<<'End')
    #   <html>
    #   <meta name="robots" content="index,nofollow">
    #   <meta name="author" content="Who am I?">    
    #   </html>
    #   End
    #   t.traverse_element("{http://www.w3.org/1999/xhtml}meta") {|e| p e}
    #   # =>
    #   {emptyelem <{http://www.w3.org/1999/xhtml}meta name="robots" content="index,nofollow">}
    #   {emptyelem <{http://www.w3.org/1999/xhtml}meta name="author" content="Who am I?">}
    #
    def traverse_element(*names, &block) # :yields: element
      if names.empty?
        traverse_all_element(&block)
      else
        name_set = {}
        names.each {|n| name_set[n] = true }
        traverse_some_element(name_set, &block)
      end
      nil
    end

    def each_hyperlink_attribute
      traverse_element(
          '{http://www.w3.org/1999/xhtml}a',
          '{http://www.w3.org/1999/xhtml}area',
          '{http://www.w3.org/1999/xhtml}link',
          '{http://www.w3.org/1999/xhtml}img',
          '{http://www.w3.org/1999/xhtml}object',
          '{http://www.w3.org/1999/xhtml}q',
          '{http://www.w3.org/1999/xhtml}blockquote',
          '{http://www.w3.org/1999/xhtml}ins',
          '{http://www.w3.org/1999/xhtml}del',
          '{http://www.w3.org/1999/xhtml}form',
          '{http://www.w3.org/1999/xhtml}input',
          '{http://www.w3.org/1999/xhtml}head',
          '{http://www.w3.org/1999/xhtml}base',
          '{http://www.w3.org/1999/xhtml}script') {|elem|
        case elem.name
        when %r{\{http://www.w3.org/1999/xhtml\}(?:base|a|area|link)\z}i
          attrs = ['href']
        when %r{\{http://www.w3.org/1999/xhtml\}(?:img)\z}i
          attrs = ['src', 'longdesc', 'usemap']
        when %r{\{http://www.w3.org/1999/xhtml\}(?:object)\z}i
          attrs = ['classid', 'codebase', 'data', 'usemap']
        when %r{\{http://www.w3.org/1999/xhtml\}(?:q|blockquote|ins|del)\z}i
          attrs = ['cite']
        when %r{\{http://www.w3.org/1999/xhtml\}(?:form)\z}i
          attrs = ['action']
        when %r{\{http://www.w3.org/1999/xhtml\}(?:input)\z}i
          attrs = ['src', 'usemap']
        when %r{\{http://www.w3.org/1999/xhtml\}(?:head)\z}i
          attrs = ['profile']
        when %r{\{http://www.w3.org/1999/xhtml\}(?:script)\z}i
          attrs = ['src', 'for']
        end
        attrs.each {|attr|
          if hyperlink = elem.get_attribute(attr)
            yield elem, attr, hyperlink
          end
        }
      }
    end
    private :each_hyperlink_attribute

    # +each_hyperlink_uri+ traverses hyperlinks such as HTML href attribute
    # of A element.
    #
    # It yields HTree::Text (or HTree::Loc) and URI for each hyperlink.
    #
    # The URI objects are created with a base URI which is given by
    # HTML BASE element or the argument ((|base_uri|)).
    # +each_hyperlink_uri+ doesn't yields href of the BASE element.
    def each_hyperlink_uri(base_uri=nil) # :yields: hyperlink, uri
      base_uri = URI.parse(base_uri) if String === base_uri
      links = []
      each_hyperlink_attribute {|elem, attr, hyperlink|
        if %r{\{http://www.w3.org/1999/xhtml\}(?:base)\z}i =~ elem.name
          base_uri = URI.parse(hyperlink.to_s)
        else
          links << hyperlink
        end
      }
      if base_uri
        links.each {|hyperlink| yield hyperlink, base_uri + hyperlink.to_s }
      else
        links.each {|hyperlink| yield hyperlink, URI.parse(hyperlink.to_s) }
      end
    end

    # +each_hyperlink+ traverses hyperlinks such as HTML href attribute
    # of A element.
    #
    # It yields HTree::Text or HTree::Loc.
    #
    # Note that +each_hyperlink+ yields HTML href attribute of BASE element.
    def each_hyperlink # :yields: text
      links = []
      each_hyperlink_attribute {|elem, attr, hyperlink|
        yield hyperlink
      }
    end

    # +each_uri+ traverses hyperlinks such as HTML href attribute
    # of A element.
    #
    # It yields URI for each hyperlink.
    #
    # The URI objects are created with a base URI which is given by
    # HTML BASE element or the argument ((|base_uri|)).
    def each_uri(base_uri=nil) # :yields: URI
      each_hyperlink_uri(base_uri) {|hyperlink, uri| yield uri }
    end
  end

  # :stopdoc:
  module Doc::Trav
    def traverse_all_element(&block)
      children.each {|c| c.traverse_all_element(&block) }
    end
  end

  module Elem::Trav
    def traverse_all_element(&block)
      yield self
      children.each {|c| c.traverse_all_element(&block) }
    end
  end

  module Leaf::Trav
    def traverse_all_element
    end
  end

  module Doc::Trav
    def traverse_some_element(name_set, &block)
      children.each {|c| c.traverse_some_element(name_set, &block) }
    end
  end

  module Elem::Trav
    def traverse_some_element(name_set, &block)
      yield self if name_set.include? self.name
      children.each {|c| c.traverse_some_element(name_set, &block) }
    end
  end

  module Leaf::Trav
    def traverse_some_element(name_set)
    end
  end
  # :startdoc:

  module Traverse
    # +traverse_text+ traverses texts in the tree
    def traverse_text(&block) # :yields: text
      traverse_text_internal(&block)
      nil
    end
  end

  # :stopdoc:
  module Container::Trav
    def traverse_text_internal(&block)
      each_child {|c| c.traverse_text_internal(&block) }
    end
  end

  module Leaf::Trav
    def traverse_text_internal
    end
  end

  module Text::Trav
    def traverse_text_internal
      yield self
    end
  end
  # :startdoc:

  module Container::Trav
    # +filter+ rebuilds the tree without some components.
    #
    #   node.filter {|descendant_node| predicate } -> node
    #   loc.filter {|descendant_loc| predicate } -> node
    #
    # +filter+ yields each node except top node.
    # If given block returns false, corresponding node is dropped.
    # If given block returns true, corresponding node is retained and
    # inner nodes are examined.
    #
    # +filter+ returns an node.
    # It doesn't return location object even if self is location object.
    #
    def filter(&block)
      subst = {}
      each_child_with_index {|descendant, i|
        if yield descendant
          if descendant.elem?
            subst[i] = descendant.filter(&block)
          else
            subst[i] = descendant
          end
        else
          subst[i] = nil
        end
      }
      to_node.subst_subnode(subst)
    end
  end

  module Doc::Trav
    # +title+ searches title and return it as a text.
    # It returns nil if not found.
    #
    # +title+ searchs following information.
    #
    # - <title>...</title> in HTML
    # - <title>...</title> in RSS
    # - <title>...</title> in Atom
    def title
      e = find_element('title',
        '{http://www.w3.org/1999/xhtml}title',
        '{http://purl.org/rss/1.0/}title',
        '{http://my.netscape.com/rdf/simple/0.9/}title',
        '{http://www.w3.org/2005/Atom}title',
        '{http://purl.org/atom/ns#}title')
      e && e.extract_text
    end

    # +author+ searches author and return it as a text.
    # It returns nil if not found.
    #
    # +author+ searchs following information.
    #
    # - <meta name="author" content="author-name"> in HTML
    # - <link rev="made" title="author-name"> in HTML
    # - <dc:creator>author-name</dc:creator> in RSS
    # - <dc:publisher>author-name</dc:publisher> in RSS
    # - <author><name>author-name</name></author> in Atom
    def author
      traverse_element('meta',
        '{http://www.w3.org/1999/xhtml}meta') {|e|
        begin
          next unless e.fetch_attr('name').downcase == 'author'
          author = e.fetch_attribute('content').strip
          return author if !author.empty?
        rescue IndexError
        end
      }

      traverse_element('link',
        '{http://www.w3.org/1999/xhtml}link') {|e|
        begin
          next unless e.fetch_attr('rev').downcase == 'made'
          author = e.fetch_attribute('title').strip
          return author if !author.empty?
        rescue IndexError
        end
      } 

      if channel = find_element('{http://purl.org/rss/1.0/}channel')
        channel.traverse_element('{http://purl.org/dc/elements/1.1/}creator') {|e|
          begin
            author = e.extract_text.strip
            return author if !author.empty?
          rescue IndexError
          end
        }
        channel.traverse_element('{http://purl.org/dc/elements/1.1/}publisher') {|e|
          begin
            author = e.extract_text.strip
            return author if !author.empty?
          rescue IndexError
          end
        }
      end

      ['http://www.w3.org/2005/Atom', 'http://purl.org/atom/ns#'].each {|xmlns|
        each_child {|top|
          next unless top.elem?
          if top.name == "{#{xmlns}}feed"
            if feed_author = find_element("{#{xmlns}}author")
              feed_author.traverse_element("{#{xmlns}}name") {|e|
                begin
                  author = e.extract_text.strip
                  return author if !author.empty?
                rescue IndexError
                end
              }
            end
          end
        }
      }

      nil
    end

  end

  module Doc::Trav
    # +root+ searches root element.
    # If there is no element on top level, it raise HTree::Error.
    # If there is two or more elements on top level, it raise HTree::Error.
    def root
      es = []
      children.each {|c| es << c if c.elem? }
      raise HTree::Error, "no element" if es.empty?
      raise HTree::Error, "multiple top elements" if 1 < es.length
      es[0]
    end

    # +has_xmldecl?+ returns true if there is an XML declaration on top level.
    def has_xmldecl?
      children.each {|c| return true if c.xmldecl? }
      false
    end
  end

  module Elem::Trav
    # +name+ returns the universal name of the element as a string.
    #
    #   p HTree('<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"/>').root.name
    #   # =>
    #   "{http://www.w3.org/1999/02/22-rdf-syntax-ns#}RDF"
    #
    def name() element_name.universal_name end

    # +qualified_name+ returns the qualified name of the element as a string.
    #
    #   p HTree('<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"/>').root.qualified_name
    #   # =>
    #   "rdf:RDF"
    def qualified_name() element_name.qualified_name end

    # +attributes+ returns attributes as a hash.
    # The hash keys are HTree::Name objects.
    # The hash values are HTree::Text or HTree::Location objects.
    #
    #   p HTree('<a name="xx" href="uu">').root.attributes
    #   # =>
    #   {href=>{text "uu"}, name=>{text "xx"}}
    #
    #   p HTree('<a name="xx" href="uu">').make_loc.root.attributes
    #   # =>
    #   {href=>#<HTree::Location: doc()/a/@href>, name=>#<HTree::Location: doc()/a/@name>}
    #
    def attributes
      result = {}
      each_attribute {|name, text|
        result[name] = text
      }
      result
    end

    def each_attr
      each_attribute {|name, text|
        uname = name.universal_name
        str = text.to_s
        yield uname, str
      }
    end

    # call-seq:
    #   elem.fetch_attribute(name) -> text or raise IndexError
    #   elem.fetch_attribute(name, default) -> text or default
    #   elem.fetch_attribute(name) {|uname| default } -> text or default
    #
    # +fetch_attribute+ returns an attribute value as a text.
    #
    # elem may be an instance of HTree::Elem or a location points to it.
    def fetch_attribute(uname, *rest, &block)
      if 1 < rest.length
        raise ArgumentError, "wrong number of arguments (#{1+rest.length} for 2)"
      end
      if !rest.empty? && block_given?
        raise ArgumentError, "block supersedes default value argument"
      end
      uname = uname.universal_name if uname.respond_to? :universal_name
      return update_attribute_hash.fetch(uname) {
        if block_given?
          return yield(uname)
        elsif !rest.empty?
          return rest[0]
        else
          raise IndexError, "attribute not found: #{uname.inspect}"
        end
      }
    end

    # call-seq:
    #   elem.fetch_attr(name) -> string or raise IndexError
    #   elem.fetch_attr(name, default) -> string or default
    #   elem.fetch_attr(name) {|uname| default } -> string or default
    #
    # +fetch_attr+ returns an attribute value as a string.
    #
    # elem may be an instance of HTree::Elem or a location points to it.
    def fetch_attr(uname, *rest, &block)
      if 1 < rest.length
        raise ArgumentError, "wrong number of arguments (#{1+rest.length} for 2)"
      end
      if !rest.empty? && block_given?
        raise ArgumentError, "block supersedes default value argument"
      end
      uname = uname.universal_name if uname.respond_to? :universal_name
      return update_attribute_hash.fetch(uname) {
        if block_given?
          return yield(uname)
        elsif !rest.empty?
          return rest[0]
        else
          raise IndexError, "attribute not found: #{uname.inspect}"
        end
      }.to_s
    end

    def get_attribute(uname)
      uname = uname.universal_name if uname.respond_to? :universal_name
      update_attribute_hash[uname]
    end 

    def get_attr(uname)
      if text = update_attribute_hash[uname]
        text.to_s
      else
        nil 
      end
    end

  end

end
