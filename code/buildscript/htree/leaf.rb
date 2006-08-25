require 'htree/modules'
require 'htree/raw_string'

module HTree
  class XMLDecl
    def initialize(version, encoding=nil, standalone=nil)
      init_raw_string
      if /\A[a-zA-Z0-9_.:-]+\z/ !~ version
        raise HTree::Error, "invalid version in XML declaration: #{version.inspect}"
      end
      if encoding && /\A[A-Za-z][A-Za-z0-9._-]*\z/ !~ encoding
        raise HTree::Error, "invalid encoding in XML declaration: #{encoding.inspect}"
      end
      unless standalone == nil || standalone == true || standalone == false
        raise HTree::Error, "invalid standalone document declaration in XML declaration: #{standalone.inspect}"
      end
      @version = version
      @encoding = encoding
      @standalone = standalone
    end
    attr_reader :version, :encoding, :standalone
  end

  class DocType
    def initialize(root_element_name, public_identifier=nil, system_identifier=nil)
      init_raw_string
      if public_identifier && /\A[ \x0d\x0aa-zA-Z0-9\-'()+,.\/:=?;!*\#@$_%]*\z/ !~ public_identifier
        raise HTree::Error, "invalid public identifier in document type declaration: #{public_identifier.inspect}"
      end
      if system_identifier && /"/ =~ system_identifier && /'/ =~ system_identifier
        raise HTree::Error, "invalid system identifier in document type declaration: #{system_identifier.inspect}"
      end

      @root_element_name = root_element_name
      @public_identifier = public_identifier
      @system_identifier = system_identifier
    end
    attr_reader :root_element_name, :public_identifier, :system_identifier
  end

  class ProcIns
    # :stopdoc:
    class << self
      alias new! new
    end
    # :startdoc:

    def ProcIns.new(target, content)
      content = content.gsub(/\?>/, '? >') if content
      new! target, content
    end

    def initialize(target, content) # :notnew:
      init_raw_string
      if content && /\?>/ =~ content
        raise HTree::Error, "invalid processing instruction content: #{content.inspect}"
      end
      @target = target
      @content = content
    end
    attr_reader :target, :content
  end

  class Comment
    # :stopdoc:
    class << self
      alias new! new
    end
    # :startdoc:

    def Comment.new(content)
      content = content.gsub(/-(-+)/) { '-' + ' -' * $1.length }.sub(/-\z/, '- ')
      new! content
    end

    def initialize(content) # :notnew:
      init_raw_string
      if /--/ =~ content || /-\z/ =~ content
        raise HTree::Error, "invalid comment content: #{content.inspect}"
      end
      @content = content
    end
    attr_reader :content
  end

  class BogusETag
    def initialize(qualified_name)
      init_raw_string
      @etag = ETag.new(qualified_name)
    end
  end
end
