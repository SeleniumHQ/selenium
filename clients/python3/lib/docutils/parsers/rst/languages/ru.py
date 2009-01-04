# Author: Roman Suzi
# Contact: rnd@onego.ru
# Revision: $Revision: 4229 $
# Date: $Date: 2005-12-23 00:46:16 +0100 (Fri, 23 Dec 2005) $
# Copyright: This module has been placed in the public domain.

# New language mappings are welcome.  Before doing a new translation, please
# read <http://docutils.sf.net/docs/howto/i18n.html>.  Two files must be
# translated for each language: one in docutils/languages, the other in
# docutils/parsers/rst/languages.

"""
Russian-language mappings for language-dependent features of
reStructuredText.
"""

__docformat__ = 'reStructuredText'

directives = {
 u'\u0431\u043b\u043e\u043a-\u0441\u0442\u0440\u043e\u043a': u'line-block',
 u'meta': u'meta',
 u'\u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0430\u043d\u043d\u044b\u0439-\u043b\u0438\u0442\u0435\u0440\u0430\u043b':
 u'parsed-literal',
 u'\u0432\u044b\u0434\u0435\u043b\u0435\u043d\u043d\u0430\u044f-\u0446\u0438\u0442\u0430\u0442\u0430':
 u'pull-quote',
 u'compound (translation required)': 'compound',
 u'container (translation required)': 'container',
 u'table (translation required)': 'table',
 u'csv-table (translation required)': 'csv-table',
 u'list-table (translation required)': 'list-table',
 u'\u0441\u044b\u0440\u043e\u0439': u'raw',
 u'\u0437\u0430\u043c\u0435\u043d\u0430': u'replace',
 u'\u0442\u0435\u0441\u0442\u043e\u0432\u0430\u044f-\u0434\u0438\u0440\u0435\u043a\u0442\u0438\u0432\u0430-restructuredtext':
 u'restructuredtext-test-directive',
 u'\u0446\u0435\u043b\u0435\u0432\u044b\u0435-\u0441\u043d\u043e\u0441\u043a\u0438': 
 u'target-notes',
 u'unicode': u'unicode',
 u'\u0434\u0430\u0442\u0430': u'date',
 u'\u0431\u043e\u043a\u043e\u0432\u0430\u044f-\u043f\u043e\u043b\u043e\u0441\u0430':
 u'sidebar',
 u'\u0432\u0430\u0436\u043d\u043e': u'important',
 u'\u0432\u043a\u043b\u044e\u0447\u0430\u0442\u044c': u'include',
 u'\u0432\u043d\u0438\u043c\u0430\u043d\u0438\u0435': u'attention',
 u'\u0432\u044b\u0434\u0435\u043b\u0435\u043d\u0438\u0435': u'highlights',
 u'\u0437\u0430\u043c\u0435\u0447\u0430\u043d\u0438\u0435': u'admonition',
 u'\u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435':
 u'image',
 u'\u043a\u043b\u0430\u0441\u0441': u'class',
 u'role (translation required)': 'role',
 u'default-role (translation required)': 'default-role',
 u'title (translation required)': 'title',
 u'\u043d\u043e\u043c\u0435\u0440-\u0440\u0430\u0437\u0434\u0435\u043b\u0430':
 u'sectnum',
 u'\u043d\u0443\u043c\u0435\u0440\u0430\u0446\u0438\u044f-\u0440\u0430\u0437'
 u'\u0434\u0435\u043b\u043e\u0432': u'sectnum',
 u'\u043e\u043f\u0430\u0441\u043d\u043e': u'danger',
 u'\u043e\u0441\u0442\u043e\u0440\u043e\u0436\u043d\u043e': u'caution',
 u'\u043e\u0448\u0438\u0431\u043a\u0430': u'error',
 u'\u043f\u043e\u0434\u0441\u043a\u0430\u0437\u043a\u0430': u'tip',
 u'\u043f\u0440\u0435\u0434\u0443\u043f\u0440\u0435\u0436\u0434\u0435\u043d'
 u'\u0438\u0435': u'warning',
 u'\u043f\u0440\u0438\u043c\u0435\u0447\u0430\u043d\u0438\u0435': u'note',
 u'\u0440\u0438\u0441\u0443\u043d\u043e\u043a': u'figure',
 u'\u0440\u0443\u0431\u0440\u0438\u043a\u0430': u'rubric',
 u'\u0441\u043e\u0432\u0435\u0442': u'hint',
 u'\u0441\u043e\u0434\u0435\u0440\u0436\u0430\u043d\u0438\u0435': u'contents',
 u'\u0442\u0435\u043c\u0430': u'topic',
 u'\u044d\u043f\u0438\u0433\u0440\u0430\u0444': u'epigraph',
 u'header (translation required)': 'header',
 u'footer (translation required)': 'footer',}
"""Russian name to registered (in directives/__init__.py) directive name
mapping."""

roles = {
 u'\u0430\u043a\u0440\u043e\u043d\u0438\u043c': 'acronym',
 u'\u0430\u043d\u043e\u043d\u0438\u043c\u043d\u0430\u044f-\u0441\u0441\u044b\u043b\u043a\u0430':
  'anonymous-reference',
 u'\u0431\u0443\u043a\u0432\u0430\u043b\u044c\u043d\u043e': 'literal',
 u'\u0432\u0435\u0440\u0445\u043d\u0438\u0439-\u0438\u043d\u0434\u0435\u043a\u0441':
  'superscript',
 u'\u0432\u044b\u0434\u0435\u043b\u0435\u043d\u0438\u0435': 'emphasis',
 u'\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u043d\u0430\u044f-\u0441\u0441\u044b\u043b\u043a\u0430':
  'named-reference',
 u'\u0438\u043d\u0434\u0435\u043a\u0441': 'index',
 u'\u043d\u0438\u0436\u043d\u0438\u0439-\u0438\u043d\u0434\u0435\u043a\u0441':
  'subscript',
 u'\u0441\u0438\u043b\u044c\u043d\u043e\u0435-\u0432\u044b\u0434\u0435\u043b\u0435\u043d\u0438\u0435':
  'strong',
 u'\u0441\u043e\u043a\u0440\u0430\u0449\u0435\u043d\u0438\u0435':
  'abbreviation',
 u'\u0441\u0441\u044b\u043b\u043a\u0430-\u0437\u0430\u043c\u0435\u043d\u0430':
  'substitution-reference',
 u'\u0441\u0441\u044b\u043b\u043a\u0430-\u043d\u0430-pep': 'pep-reference',
 u'\u0441\u0441\u044b\u043b\u043a\u0430-\u043d\u0430-rfc': 'rfc-reference',
 u'\u0441\u0441\u044b\u043b\u043a\u0430-\u043d\u0430-uri': 'uri-reference',
 u'\u0441\u0441\u044b\u043b\u043a\u0430-\u043d\u0430-\u0437\u0430\u0433\u043b\u0430\u0432\u0438\u0435':
  'title-reference',
 u'\u0441\u0441\u044b\u043b\u043a\u0430-\u043d\u0430-\u0441\u043d\u043e\u0441\u043a\u0443':
  'footnote-reference',
 u'\u0446\u0438\u0442\u0430\u0442\u043d\u0430\u044f-\u0441\u0441\u044b\u043b\u043a\u0430':
  'citation-reference',
 u'\u0446\u0435\u043b\u044c': 'target',
 u'raw (translation required)': 'raw',}
"""Mapping of Russian role names to canonical role names for interpreted text.
"""
