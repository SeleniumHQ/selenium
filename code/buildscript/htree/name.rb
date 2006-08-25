require 'htree/scan' # for Pat::Nmtoken
require 'htree/context'

module HTree
  # Name represents a element name and attribute name.
  # It consists of a namespace prefix, a namespace URI and a local name.
  class Name
=begin
element name                    prefix  uri     localname
{u}n, n with xmlns=u            nil     'u'     'n'
p{u}n, p:n with xmlns:p=u       'p'     'u'     'n'
n with xmlns=''                 nil     ''      'n'

attribute name
xmlns=                          'xmlns' nil     nil
xmlns:n=                        'xmlns' nil     'n'
p{u}n=, p:n= with xmlns:p=u     'p'     'u'     'n'
n=                              nil     ''      'n'
=end
    def Name.parse_element_name(name, context)
      if /\{(.*)\}/ =~ name
        # "{u}n" means "use default namespace",
        # "p{u}n" means "use the specified prefix p"
        $` == '' ? Name.new(nil, $1, $') : Name.new($`, $1, $')
      elsif /:/ =~ name && !context.namespace_uri($`).empty?
        Name.new($`, context.namespace_uri($`), $')
      elsif !context.namespace_uri(nil).empty?
        Name.new(nil, context.namespace_uri(nil), name)
      else
        Name.new(nil, '', name)
      end
    end

    def Name.parse_attribute_name(name, context)
      if name == 'xmlns'
        Name.new('xmlns', nil, nil)
      elsif /\Axmlns:/ =~ name
        Name.new('xmlns', nil, $')
      elsif /\{(.*)\}/ =~ name
        case $`
        when ''; Name.new(nil, $1, $')
        else Name.new($`, $1, $')
        end
      elsif /:/ =~ name && !context.namespace_uri($`).empty?
        Name.new($`, context.namespace_uri($`), $')
      else
        Name.new(nil, '', name)
      end
    end

    NameCache = {}
    def Name.new(namespace_prefix, namespace_uri, local_name)
      key = [namespace_prefix, namespace_uri, local_name, self]
      NameCache.fetch(key) {
        0.upto(2) {|i| key[i] = key[i].dup.freeze if key[i] }
        NameCache[key] = super(key[0], key[1], key[2])
      }
    end

    def initialize(namespace_prefix, namespace_uri, local_name)
      @namespace_prefix = namespace_prefix
      @namespace_uri = namespace_uri
      @local_name = local_name
      if @namespace_prefix && /\A#{Pat::Nmtoken}\z/o !~ @namespace_prefix
        raise HTree::Error, "invalid namespace prefix: #{@namespace_prefix.inspect}"
      end
      if @local_name && /\A#{Pat::Nmtoken}\z/o !~ @local_name
        raise HTree::Error, "invalid local name: #{@local_name.inspect}"
      end
      if @namespace_prefix == 'xmlns'
        unless @namespace_uri == nil
          raise HTree::Error, "Name object for xmlns:* must not have namespace URI: #{@namespace_uri.inspect}"
        end
      else
        unless String === @namespace_uri 
          raise HTree::Error, "invalid namespace URI: #{@namespace_uri.inspect}"
        end
      end
    end
    attr_reader :namespace_prefix, :namespace_uri, :local_name

    def xmlns?
      @namespace_prefix == 'xmlns' && @namespace_uri == nil
    end

    def universal_name
      if @namespace_uri && !@namespace_uri.empty?
        "{#{@namespace_uri}}#{@local_name}"
      else
        @local_name.dup
      end
    end

    def qualified_name
      if @namespace_uri && !@namespace_uri.empty?
        if @namespace_prefix
          "#{@namespace_prefix}:#{@local_name}"
        else
          @local_name.dup
        end
      elsif @local_name
        @local_name.dup
      else
        "xmlns"
      end
    end

    def to_s
      if @namespace_uri && !@namespace_uri.empty?
        if @namespace_prefix
          "#{@namespace_prefix}{#{@namespace_uri}}#{@local_name}"
        else
          "{#{@namespace_uri}}#{@local_name}"
        end
      elsif @local_name
        @local_name.dup
      else
        "xmlns"
      end
    end
  end
end
