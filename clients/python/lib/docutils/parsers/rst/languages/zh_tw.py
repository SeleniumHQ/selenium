# -*- coding: utf-8 -*-
# Author: David Goodger
# Contact: goodger@users.sourceforge.net
# Revision: $Revision: 4229 $
# Date: $Date: 2005-12-23 00:46:16 +0100 (Fri, 23 Dec 2005) $
# Copyright: This module has been placed in the public domain.

# New language mappings are welcome.  Before doing a new translation, please
# read <http://docutils.sf.net/docs/howto/i18n.html>.  Two files must be
# translated for each language: one in docutils/languages, the other in
# docutils/parsers/rst/languages.

"""
Traditional Chinese language mappings for language-dependent features of
reStructuredText.
"""

__docformat__ = 'reStructuredText'


directives = {
      # language-dependent: fixed
      'attention (translation required)': 'attention',
      'caution (translation required)': 'caution',
      'danger (translation required)': 'danger',
      'error (translation required)': 'error',
      'hint (translation required)': 'hint',
      'important (translation required)': 'important',
      'note (translation required)': 'note',
      'tip (translation required)': 'tip',
      'warning (translation required)': 'warning',
      'admonition (translation required)': 'admonition',
      'sidebar (translation required)': 'sidebar',
      'topic (translation required)': 'topic',
      'line-block (translation required)': 'line-block',
      'parsed-literal (translation required)': 'parsed-literal',
      'rubric (translation required)': 'rubric',
      'epigraph (translation required)': 'epigraph',
      'highlights (translation required)': 'highlights',
      'pull-quote (translation required)': 'pull-quote',
      'compound (translation required)': 'compound',
      u'container (translation required)': 'container',
      #'questions (translation required)': 'questions',
      'table (translation required)': 'table',
      'csv-table (translation required)': 'csv-table',
      'list-table (translation required)': 'list-table',
      #'qa (translation required)': 'questions',
      #'faq (translation required)': 'questions',
      'meta (translation required)': 'meta',
      #'imagemap (translation required)': 'imagemap',
      'image (translation required)': 'image',
      'figure (translation required)': 'figure',
      'include (translation required)': 'include',
      'raw (translation required)': 'raw',
      'replace (translation required)': 'replace',
      'unicode (translation required)': 'unicode',
      u'日期': 'date',
      'class (translation required)': 'class',
      'role (translation required)': 'role',
      u'default-role (translation required)': 'default-role',
      u'title (translation required)': 'title',
      'contents (translation required)': 'contents',
      'sectnum (translation required)': 'sectnum',
      'section-numbering (translation required)': 'sectnum',
      u'header (translation required)': 'header',
      u'footer (translation required)': 'footer',
      #'footnotes (translation required)': 'footnotes',
      #'citations (translation required)': 'citations',
      'target-notes (translation required)': 'target-notes',
      'restructuredtext-test-directive': 'restructuredtext-test-directive'}
"""Traditional Chinese name to registered (in directives/__init__.py)
directive name mapping."""

roles = {
    # language-dependent: fixed
    'abbreviation (translation required)': 'abbreviation',
    'ab (translation required)': 'abbreviation',
    'acronym (translation required)': 'acronym',
    'ac (translation required)': 'acronym',
    'index (translation required)': 'index',
    'i (translation required)': 'index',
    'subscript (translation required)': 'subscript',
    'sub (translation required)': 'subscript',
    'superscript (translation required)': 'superscript',
    'sup (translation required)': 'superscript',
    'title-reference (translation required)': 'title-reference',
    'title (translation required)': 'title-reference',
    't (translation required)': 'title-reference',
    'pep-reference (translation required)': 'pep-reference',
    'pep (translation required)': 'pep-reference',
    'rfc-reference (translation required)': 'rfc-reference',
    'rfc (translation required)': 'rfc-reference',
    'emphasis (translation required)': 'emphasis',
    'strong (translation required)': 'strong',
    'literal (translation required)': 'literal',
    'named-reference (translation required)': 'named-reference',
    'anonymous-reference (translation required)': 'anonymous-reference',
    'footnote-reference (translation required)': 'footnote-reference',
    'citation-reference (translation required)': 'citation-reference',
    'substitution-reference (translation required)': 'substitution-reference',
    'target (translation required)': 'target',
    'uri-reference (translation required)': 'uri-reference',
    'uri (translation required)': 'uri-reference',
    'url (translation required)': 'uri-reference',
    'raw (translation required)': 'raw',}
"""Mapping of Traditional Chinese role names to canonical role names for
interpreted text."""
