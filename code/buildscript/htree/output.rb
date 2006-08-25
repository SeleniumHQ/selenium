require 'htree/encoder'
require 'htree/doc'
require 'htree/elem'
require 'htree/leaf'
require 'htree/text'

module HTree
  # :stopdoc:

  class Text
    ChRef = {
      '>' => '&gt;',
      '<' => '&lt;',
      '"' => '&quot;',
    }

    def output(out, context=nil)
      out.output_text @rcdata.gsub(/[<>]/) {|s| ChRef[s] }
    end

    def to_attvalue_content
      @rcdata.gsub(/[<>"]/) {|s| ChRef[s] }
    end

    def output_attvalue(out, context)
      out.output_string '"'
      out.output_text to_attvalue_content
      out.output_string '"'
    end

    def output_cdata(out)
      str = self.to_s
      if %r{</} =~ str
        raise ArgumentError, "CDATA cannot contain '</': #{str.inspect}"
      end
      out.output_string(str)
    end
  end

  class Name
    def output(out, context)
      # xxx: validate namespace prefix
      if xmlns?
        if @local_name
          out.output_string "xmlns:#{@local_name}"
        else
          out.output_string "xmlns"
        end
      else
        out.output_string qualified_name
      end
    end

    def output_attribute(text, out, context)
      output(out, context)
      out.output_string '='
      text.output_attvalue(out, context)
    end
  end

  class Doc
    def output(out, context)
      xmldecl = false
      @children.each {|n|
        if n.respond_to? :output_prolog_xmldecl
          n.output_prolog_xmldecl(out, context) unless xmldecl # xxx: encoding?
          xmldecl = true
        else
          n.output(out, context)
        end
      }
    end
  end

  class Elem
    def output(out, context)
      if %r{\A\{http://www.w3.org/1999/xhtml\}(script|style)} =~ @stag.element_name.universal_name
        children_context = @stag.output_stag(out, context)
        out.output_cdata_content(@children, children_context)
        @stag.output_etag(out, context)
      elsif @empty
        @stag.output_emptytag(out, context)
      else
        children_context = @stag.output_stag(out, context)
        @children.each {|n| n.output(out, children_context) }
        @stag.output_etag(out, context)
      end
    end
  end

  class STag
    def output_attributes(out, context)
      @attributes.each {|aname, text|
        next if aname.xmlns?
        out.output_string ' '
        aname.output_attribute(text, out, context)
      }
      @context.output_namespaces(out, context)
    end

    def output_emptytag(out, context)
      out.output_string '<'
      @name.output(out, context)
      children_context = output_attributes(out, context)
      out.output_string "\n"
      out.output_slash_if_xml
      out.output_string ">"
      children_context
    end

    def output_stag(out, context)
      out.output_string '<'
      @name.output(out, context)
      children_context = output_attributes(out, context)
      out.output_string "\n>"
      children_context
    end

    def output_etag(out, context)
      out.output_string '</'
      @name.output(out, context)
      out.output_string "\n>"
    end
  end

  class Context
    def output_namespaces(out, outer_context)
      unknown_namespaces = {}
      @namespaces.each {|prefix, uri|
        outer_uri = outer_context.namespace_uri(prefix)
        if outer_uri == nil
          unknown_namespaces[prefix] = uri
        elsif outer_uri != uri
          if prefix
            out.output_string " xmlns:#{prefix}="
          else
            out.output_string " xmlns="
          end
          Text.new(uri).output_attvalue(out, outer_context)
        end
      }
      unless unknown_namespaces.empty?
        out.output_xmlns(unknown_namespaces)
      end
      outer_context.subst_namespaces(@namespaces)
    end
  end

  class BogusETag
    # don't output anything.
    def output(out, context)
    end
  end

  class XMLDecl
    # don't output anything.
    def output(out, context)
    end

    def output_prolog_xmldecl(out, context)
      out.output_string "<?xml version=\"#{@version}\""
      if @encoding
        out.output_string " encoding=\"#{@encoding}\""
      end
      if @standalone != nil
        out.output_string " standalone=\"#{@standalone ? 'yes' : 'no'}\""
      end
      out.output_string "?>"
    end
  end

  class DocType
    def output(out, context)
      out.output_string "<!DOCTYPE #{@root_element_name} #{generate_content}>"
    end

    def generate_content # :nodoc:
      result = ''
      if @public_identifier
        result << "PUBLIC \"#{@public_identifier}\""
      else
        result << "SYSTEM"
      end
      # Although a system identifier is not omissible in XML,
      # we cannot output it if it is not given.
      if @system_identifier
        if /"/ !~ @system_identifier
          result << " \"#{@system_identifier}\""
        else
          result << " '#{@system_identifier}'"
        end
      end
      result
    end
  end

  class ProcIns
    def output(out, context)
      out.output_string "<?#{@target}"
      out.output_string " #{@content}" if @content
      out.output_string "?>"
    end
  end

  class Comment
    def output(out, context)
      out.output_string "<!--#{@content}-->"
    end
  end

  # :startdoc:
end
