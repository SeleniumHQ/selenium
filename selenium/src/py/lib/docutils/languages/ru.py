# Author: Roman Suzi
# Contact: rnd@onego.ru
# Revision: $Revision: 2999 $
# Date: $Date: 2005-03-03 20:35:02 +0100 (Thu, 03 Mar 2005) $
# Copyright: This module has been placed in the public domain.

# New language mappings are welcome.  Before doing a new translation, please
# read <http://docutils.sf.net/docs/howto/i18n.html>.  Two files must be
# translated for each language: one in docutils/languages, the other in
# docutils/parsers/rst/languages.

"""
Russian-language mappings for language-dependent features of Docutils.
"""

__docformat__ = 'reStructuredText'

labels = {
      u'abstract': u'\u0410\u043d\u043d\u043e\u0442\u0430\u0446\u0438\u044f',
      u'address': u'\u0410\u0434\u0440\u0435\u0441',
      u'attention': u'\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435!',
      u'author': u'\u0410\u0432\u0442\u043e\u0440',
      u'authors': u'\u0410\u0432\u0442\u043e\u0440\u044b',
      u'caution': u'\u041e\u0441\u0442\u043e\u0440\u043e\u0436\u043d\u043e!',
      u'contact': u'\u041a\u043e\u043d\u0442\u0430\u043a\u0442',
      u'contents':
      u'\u0421\u043e\u0434\u0435\u0440\u0436\u0430\u043d\u0438\u0435',
      u'copyright': u'\u041f\u0440\u0430\u0432\u0430 '
      u'\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f',
      u'danger': u'\u041e\u041f\u0410\u0421\u041d\u041e!',
      u'date': u'\u0414\u0430\u0442\u0430',
      u'dedication':
      u'\u041f\u043e\u0441\u0432\u044f\u0449\u0435\u043d\u0438\u0435',
      u'error': u'\u041e\u0448\u0438\u0431\u043a\u0430',
      u'hint': u'\u0421\u043e\u0432\u0435\u0442',
      u'important': u'\u0412\u0430\u0436\u043d\u043e',
      u'note': u'\u041f\u0440\u0438\u043c\u0435\u0447\u0430\u043d\u0438\u0435',
      u'organization':
      u'\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0446\u0438\u044f',
      u'revision': u'\u0420\u0435\u0434\u0430\u043a\u0446\u0438\u044f',
      u'status': u'\u0421\u0442\u0430\u0442\u0443\u0441',
      u'tip': u'\u041f\u043e\u0434\u0441\u043a\u0430\u0437\u043a\u0430',
      u'version': u'\u0412\u0435\u0440\u0441\u0438\u044f',
      u'warning': u'\u041f\u0440\u0435\u0434\u0443\u043f\u0440\u0435\u0436'
      u'\u0434\u0435\u043d\u0438\u0435'}
"""Mapping of node class name to label text."""

bibliographic_fields = {
      u'\u0430\u043d\u043d\u043e\u0442\u0430\u0446\u0438\u044f': u'abstract',
      u'\u0430\u0434\u0440\u0435\u0441': u'address',
      u'\u0430\u0432\u0442\u043e\u0440': u'author',
      u'\u0430\u0432\u0442\u043e\u0440\u044b': u'authors',
      u'\u043a\u043e\u043d\u0442\u0430\u043a\u0442': u'contact',
      u'\u043f\u0440\u0430\u0432\u0430 \u043a\u043e\u043f\u0438\u0440\u043e'
      u'\u0432\u0430\u043d\u0438\u044f': u'copyright',
      u'\u0434\u0430\u0442\u0430': u'date',
      u'\u043f\u043e\u0441\u0432\u044f\u0449\u0435\u043d\u0438\u0435':
      u'dedication',
      u'\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0446\u0438\u044f':
      u'organization',
      u'\u0440\u0435\u0434\u0430\u043a\u0446\u0438\u044f': u'revision',
      u'\u0441\u0442\u0430\u0442\u0443\u0441': u'status',
      u'\u0432\u0435\u0440\u0441\u0438\u044f': u'version'}
"""Russian (lowcased) to canonical name mapping for bibliographic fields."""

author_separators =  [';', ',']
"""List of separator strings for the 'Authors' bibliographic field. Tried in
order."""
