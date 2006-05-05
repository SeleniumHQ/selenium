# Author: Martijn Pieters
# Contact: mjpieters@users.sourceforge.net
# Revision: $Revision: 3058 $
# Date: $Date: 2005-03-18 21:09:22 +0100 (Fri, 18 Mar 2005) $
# Copyright: This module has been placed in the public domain.

# New language mappings are welcome.  Before doing a new translation, please
# read <http://docutils.sf.net/docs/howto/i18n.html>.  Two files must be
# translated for each language: one in docutils/languages, the other in
# docutils/parsers/rst/languages.

"""
Dutch-language mappings for language-dependent features of Docutils.
"""

__docformat__ = 'reStructuredText'

labels = {
      # fixed: language-dependent
      'author': 'Auteur',
      'authors': 'Auteurs',
      'organization': 'Organisatie',
      'address': 'Adres',
      'contact': 'Contact',
      'version': 'Versie',
      'revision': 'Revisie',
      'status': 'Status',
      'date': 'Datum',
      'copyright': 'Copyright',
      'dedication': 'Toewijding',
      'abstract': 'Samenvatting',
      'attention': 'Attentie!',
      'caution': 'Let op!',
      'danger': '!GEVAAR!',
      'error': 'Fout',
      'hint': 'Hint',
      'important': 'Belangrijk',
      'note': 'Opmerking',
      'tip': 'Tip',
      'warning': 'Waarschuwing',
      'contents': 'Inhoud'}
"""Mapping of node class name to label text."""

bibliographic_fields = {
      # language-dependent: fixed
      'auteur': 'author',
      'auteurs': 'authors',
      'organisatie': 'organization',
      'adres': 'address',
      'contact': 'contact',
      'versie': 'version',
      'revisie': 'revision',
      'status': 'status',
      'datum': 'date',
      'copyright': 'copyright',
      'toewijding': 'dedication',
      'samenvatting': 'abstract'}
"""Dutch (lowcased) to canonical name mapping for bibliographic fields."""

author_separators = [';', ',']
"""List of separator strings for the 'Authors' bibliographic field. Tried in
order."""
