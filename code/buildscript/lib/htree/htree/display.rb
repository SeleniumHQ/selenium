require 'htree/output'

module HTree
  module Node
    # HTree::Node#display_xml prints the node as XML.
    #
    # The first optional argument, <i>out</i>,
    # specifies output target.
    # It should respond to <tt><<</tt>.
    # If it is not specified, $stdout is used.
    #
    # The second optional argument, <i>encoding</i>,
    # specifies output MIME charset (character encoding).
    # If it is not specified, HTree::Encoder.internal_charset is used.
    #
    # HTree::Node#display_xml returns <i>out</i>.
    def display_xml(out=$stdout, encoding=HTree::Encoder.internal_charset)
      encoder = HTree::Encoder.new(encoding)
      self.output(encoder, HTree::DefaultContext)
      # don't call finish_with_xmldecl because self already has a xml decl.
      out << encoder.finish
      out
    end

    # HTree::Node#display_html prints the node as HTML.
    #
    # The first optional argument, <i>out</i>,
    # specifies output target.
    # It should respond to <tt><<</tt>.
    # If it is not specified, $stdout is used.
    #
    # The second optional argument, <i>encoding</i>,
    # specifies output MIME charset (character encoding).
    # If it is not specified, HTree::Encoder.internal_charset is used.
    #
    # HTree::Node#display_html returns <i>out</i>.
    def display_html(out=$stdout, encoding=HTree::Encoder.internal_charset)
      encoder = HTree::Encoder.new(encoding)
      encoder.html_output = true
      self.output(encoder, HTree::HTMLContext)
      out << encoder.finish
      out
    end

  end
end
