require 'htree/doc'
require 'htree/elem'
require 'htree/leaf'
require 'htree/tag'
require 'htree/raw_string'
require 'htree/context'

module HTree
  # compare tree structures.
  def ==(other)
    check_equality(self, other, :usual_equal_object)
  end
  alias eql? ==

  # hash value for the tree structure.
  def hash
    return @hash_code if defined? @hash_code
    @hash_code = usual_equal_object.hash
  end

  # :stopdoc:

  def usual_equal_object
    return @usual_equal_object if defined? @usual_equal_object
    @usual_equal_object = make_usual_equal_object
  end

  def make_usual_equal_object
    raise NotImplementedError
  end

  def exact_equal_object
    return @exact_equal_object if defined? @exact_equal_object
    @exact_equal_object = make_exact_equal_object
  end

  def make_exact_equal_object
    raise NotImplementedError
  end

  def exact_equal?(other)
    check_equality(self, other, :exact_equal_object)
  end

  def check_equality(obj1, obj2, equal_object_method)
    return false unless obj1.class == obj2.class
    if obj1.class == Array
      return false unless obj1.length == obj2.length
      obj1.each_with_index {|c1, i|
        return false unless c1.class == obj2[i].class
      }
      obj1.each_with_index {|c1, i|
        return false unless check_equality(c1, obj2[i], equal_object_method)
      }
      true
    elsif obj1.respond_to? equal_object_method
      o1 = obj1.send(equal_object_method)
      o2 = obj2.send(equal_object_method)
      check_equality(o1, o2, equal_object_method)
    else
      obj1 == obj2
    end
  end

  class Doc
    alias exact_equal_object children
    alias usual_equal_object children
  end

  class Elem
    def make_exact_equal_object
      [@stag, @children, @empty, @etag]
    end

    def make_usual_equal_object
      [@stag, @children]
    end
  end

  class Name
    def make_exact_equal_object
      [@namespace_prefix, @namespace_uri, @local_name]
    end

    def make_usual_equal_object
      xmlns? ? @local_name : [@namespace_uri, @local_name]
    end
  end

  module Util
    module_function
    def cmp_with_nil(a, b)
      if a == nil
        if b == nil
          0
        else
          -1
        end
      else
        if b == nil
          1
        else
          a <=> b
        end
      end
    end
  end

  class Context
    def make_exact_equal_object
      @namespaces.keys.sort {|prefix1, prefix2|
        Util.cmp_with_nil(prefix1, prefix2)
      }.map {|prefix| [prefix, @namespaces[prefix]] }
    end

    # make_usual_equal_object is not used through STag#make_usual_equal_object
    # NotImplementedError is suitable?
    alias make_usual_equal_object make_exact_equal_object
  end

  class STag
    def make_exact_equal_object
      [@raw_string,
       @name,
       @attributes.sort {|(n1,t1), (n2, t2)|
         Util.cmp_with_nil(n1.namespace_prefix, n2.namespace_prefix).nonzero? ||
         Util.cmp_with_nil(n1.namespace_uri, n2.namespace_uri).nonzero? ||
         Util.cmp_with_nil(n1.local_name, n2.local_name)
        },
        @inherited_context
      ]
    end

    def make_usual_equal_object
      [@name,
       @attributes.find_all {|n,t| !n.xmlns? }.sort {|(n1,t1), (n2, t2)|
         Util.cmp_with_nil(n1.namespace_prefix, n2.namespace_prefix).nonzero? ||
         Util.cmp_with_nil(n1.namespace_uri, n2.namespace_uri).nonzero? ||
         Util.cmp_with_nil(n1.local_name, n2.local_name)
        }
      ]
    end

  end

  class ETag
    def make_exact_equal_object
      [@raw_string, @qualified_name]
    end

    alias usual_equal_object qualified_name
  end

  class Text
    def make_exact_equal_object
      [@raw_string, @rcdata]
    end

    def make_usual_equal_object
      @normalized_rcdata
    end
  end

  class XMLDecl
    def make_exact_equal_object
      [@raw_string, @version, @encoding, @standalone]
    end

    def make_usual_equal_object
      [@version, @encoding, @standalone]
    end
  end

  class DocType
    def make_exact_equal_object
      [@raw_string, @root_element_name, @system_identifier, @public_identifier]
    end

    def make_usual_equal_object
      [@root_element_name, @system_identifier, @public_identifier]
    end
  end

  class ProcIns
    def make_exact_equal_object
      [@raw_string, @target, @content]
    end

    def make_usual_equal_object
      [@target, @content]
    end
  end

  class Comment
    def make_exact_equal_object
      [@raw_string, @content]
    end

    alias usual_equal_object content
  end

  class BogusETag
    def make_exact_equal_object
      [@etag]
    end

    alias usual_equal_object make_exact_equal_object
  end

  class Location
    def make_exact_equal_object
      [@parent, @index, @node]
    end

    alias usual_equal_object make_exact_equal_object
  end

  # :startdoc:
end
