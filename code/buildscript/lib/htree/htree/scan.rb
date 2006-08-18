require 'htree/htmlinfo'
require 'htree/regexp-util'
require 'htree/fstr'

module HTree
  # :stopdoc:
  module Pat
    NameChar = /[-A-Za-z0-9._:]/
    Name = /[A-Za-z_:]#{NameChar}*/
    Nmtoken = /#{NameChar}+/

    Comment_C = /<!--(.*?)-->/m
    Comment = Comment_C.disable_capture
    CDATA_C = /<!\[CDATA\[(.*?)\]\]>/m
    CDATA = CDATA_C.disable_capture

    QuotedAttr_C = /(#{Name})\s*=\s*(?:"([^"]*)"|'([^']*)')/
    QuotedAttr = QuotedAttr_C.disable_capture
    ValidAttr_C = /(#{Name})\s*=\s*(?:"([^"]*)"|'([^']*)'|(#{NameChar}*))|(#{Nmtoken})/
    ValidAttr = ValidAttr_C.disable_capture
    InvalidAttr1_C = /(#{Name})\s*=\s*(?:'([^'<>]*)'|"([^"<>]*)"|([^\s<>"']*(?![^\s<>"'])))|(#{Nmtoken})/
    InvalidAttr1 = InvalidAttr1_C.disable_capture
    InvalidAttr1End_C =   /(#{Name})(?:\s*=\s*(?:'([^'<>]*)|"([^"<>]*)))/
    InvalidAttr1End = InvalidAttr1End_C.disable_capture

    QuotedStartTag_C = /<(#{Name})((?:\s+#{QuotedAttr})*)\s*>/
    QuotedStartTag = QuotedStartTag_C.disable_capture
    ValidStartTag_C = /<(#{Name})((?:\s+#{ValidAttr})*)\s*>/
    ValidStartTag = ValidStartTag_C.disable_capture
    InvalidStartTag_C = /<(#{Name})((?:(?:\b|\s+)#{InvalidAttr1})*)((?:\b|\s+)#{InvalidAttr1End})?\s*>/
    InvalidStartTag = InvalidStartTag_C.disable_capture
    StartTag = /#{QuotedStartTag}|#{ValidStartTag}|#{InvalidStartTag}/

    QuotedEmptyTag_C = %r{<(#{Name})((?:\s+#{QuotedAttr})*)\s*/>}
    QuotedEmptyTag = QuotedEmptyTag_C.disable_capture
    ValidEmptyTag_C = %r{<(#{Name})((?:\s+#{ValidAttr})*)\s*/>}
    ValidEmptyTag = ValidEmptyTag_C.disable_capture
    InvalidEmptyTag_C = %r{<(#{Name})((?:(?:\b|\s+)#{InvalidAttr1})*)((?:\b|\s+)#{InvalidAttr1End})?\s*/>}
    InvalidEmptyTag = InvalidEmptyTag_C.disable_capture
    EmptyTag = /#{QuotedEmptyTag}|#{ValidEmptyTag}|#{InvalidEmptyTag}/

    EndTag_C = %r{</(#{Name})\s*>}
    EndTag = EndTag_C.disable_capture

    XmlVersionNum = /[a-zA-Z0-9_.:-]+/
    XmlVersionInfo_C = /\s+version\s*=\s*(?:'(#{XmlVersionNum})'|"(#{XmlVersionNum})")/
    XmlVersionInfo = XmlVersionInfo_C.disable_capture
    XmlEncName = /[A-Za-z][A-Za-z0-9._-]*/
    XmlEncodingDecl_C = /\s+encoding\s*=\s*(?:"(#{XmlEncName})"|'(#{XmlEncName})')/
    XmlEncodingDecl = XmlEncodingDecl_C.disable_capture
    XmlSDDecl_C = /\s+standalone\s*=\s*(?:'(yes|no)'|"(yes|no)")/
    XmlSDDecl = XmlSDDecl_C.disable_capture
    XmlDecl_C = /<\?xml#{XmlVersionInfo_C}#{XmlEncodingDecl_C}?#{XmlSDDecl_C}?\s*\?>/
    XmlDecl = /<\?xml#{XmlVersionInfo}#{XmlEncodingDecl}?#{XmlSDDecl}?\s*\?>/

    # xxx: internal DTD subset is not recognized: '[' (markupdecl | DeclSep)* ']' S?)?
    SystemLiteral_C = /"([^"]*)"|'([^']*)'/
    PubidLiteral_C = %r{"([\sa-zA-Z0-9\-'()+,./:=?;!*\#@$_%]*)"|'([\sa-zA-Z0-9\-()+,./:=?;!*\#@$_%]*)'}
    ExternalID_C = /(?:SYSTEM|PUBLIC\s+#{PubidLiteral_C})(?:\s+#{SystemLiteral_C})?/
    DocType_C = /<!DOCTYPE\s+(#{Name})(?:\s+#{ExternalID_C})?\s*(?:\[.*?\]\s*)?>/m
    DocType = DocType_C.disable_capture

    XmlProcIns_C = /<\?(#{Name})(?:\s+(.*?))?\?>/m
    XmlProcIns = XmlProcIns_C.disable_capture
    #ProcIns = /<\?([^>]*)>/m
  end

  def HTree.scan(input, is_xml=false)
    is_html = false
    cdata_content = nil
    text_start = 0
    first_element = true
    index_xmldecl = 1
    index_doctype = 2
    index_xmlprocins = 3
    index_quotedstarttag = 4
    index_quotedemptytag = 5
    index_starttag = 6
    index_endtag = 7
    index_emptytag = 8
    index_comment = 9
    index_cdata = 10
    input.scan(/(#{Pat::XmlDecl})
               |(#{Pat::DocType})
               |(#{Pat::XmlProcIns})
               |(#{Pat::QuotedStartTag})
               |(#{Pat::QuotedEmptyTag})
               |(#{Pat::StartTag})
               |(#{Pat::EndTag})
               |(#{Pat::EmptyTag})
               |(#{Pat::Comment})
               |(#{Pat::CDATA})
               /ox) {
      match = $~
      if cdata_content
        str = $&
        if match.begin(index_endtag) && str[Pat::Name] == cdata_content
          text_end = match.begin(0)
          if text_start < text_end
            yield [:text_cdata_content, HTree.frozen_string(input[text_start...text_end])]
          end
          yield [:etag, HTree.frozen_string(str)]
          text_start = match.end(0)
          cdata_content = nil
        end
      else
        str = match[0]
        text_end = match.begin(0)
        if text_start < text_end
          yield [:text_pcdata, HTree.frozen_string(input[text_start...text_end])]
        end
        text_start = match.end(0)
        if match.begin(index_xmldecl)
          yield [:xmldecl, HTree.frozen_string(str)]
          is_xml = true
        elsif match.begin(index_doctype)
          Pat::DocType_C =~ str
          root_element_name = $1
          public_identifier = $2 || $3
          system_identifier = $4 || $5
          is_html = true if /\Ahtml\z/i =~ root_element_name
          is_xml = true if public_identifier && %r{\A-//W3C//DTD XHTML } =~ public_identifier
          yield [:doctype, HTree.frozen_string(str)]
        elsif match.begin(index_xmlprocins)
          yield [:procins, HTree.frozen_string(str)]
        elsif match.begin(index_starttag) || match.begin(index_quotedstarttag)
          yield stag = [:stag, HTree.frozen_string(str)]
          tagname = str[Pat::Name]
          if first_element
            if /\A(?:html|head|title|isindex|base|script|style|meta|link|object)\z/i =~ tagname
              is_html = true
            else
              is_xml = true
            end
            first_element = false
          end
          if !is_xml && ElementContent[tagname] == :CDATA
            cdata_content = tagname
          end
        elsif match.begin(index_endtag)
          yield [:etag, HTree.frozen_string(str)]
        elsif match.begin(index_emptytag) || match.begin(index_quotedemptytag)
          yield [:emptytag, HTree.frozen_string(str)]
          first_element = false
          #is_xml = true
        elsif match.begin(index_comment)
          yield [:comment, HTree.frozen_string(str)]
        elsif match.begin(index_cdata)
          yield [:text_cdata_section, HTree.frozen_string(str)]
        else
          raise Exception, "unknown match [bug]"
        end
      end
    }
    text_end = input.length
    if text_start < text_end
      if cdata_content
        yield [:text_cdata_content, HTree.frozen_string(input[text_start...text_end])]
      else
        yield [:text_pcdata, HTree.frozen_string(input[text_start...text_end])]
      end
    end
    return is_xml, is_html
  end
  # :startdoc:
end
