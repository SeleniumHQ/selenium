# Author: Jannie Hofmeyr
# Contact: jhsh@sun.ac.za
# Revision: $Revision: 2224 $
# Date: $Date: 2004-06-05 21:40:46 +0200 (Sat, 05 Jun 2004) $
# Copyright: This module has been placed in the public domain.

# New language mappings are welcome.  Before doing a new translation, please
# read <http://docutils.sf.net/docs/howto/i18n.html>.  Two files must be
# translated for each language: one in docutils/languages, the other in
# docutils/parsers/rst/languages.

"""
Afrikaans-language mappings for language-dependent features of Docutils.
"""

__docformat__ = 'reStructuredText'

labels = {
      'author': 'Auteur',
      'authors': 'Auteurs',
      'organization': 'Organisasie',
      'address': 'Adres',
      'contact': 'Kontak',
      'version': 'Weergawe',
      'revision': 'Revisie',
      'status': 'Status',
      'date': 'Datum',
      'copyright': 'Kopiereg',
      'dedication': 'Opdrag',
      'abstract': 'Opsomming',
      'attention': 'Aandag!',
      'caution': 'Wees versigtig!',
      'danger': '!GEVAAR!',
      'error': 'Fout',
      'hint': 'Wenk',
      'important': 'Belangrik',
      'note': 'Nota',
      'tip': 'Tip', # hint and tip both have the same translation: wenk
      'warning': 'Waarskuwing',
      'contents': 'Inhoud'}
"""Mapping of node class name to label text."""

bibliographic_fields = {
      'auteur': 'author',
      'auteurs': 'authors',
      'organisasie': 'organization',
      'adres': 'address',
      'kontak': 'contact',
      'weergawe': 'version',
      'revisie': 'revision',
      'status': 'status',
      'datum': 'date',
      'kopiereg': 'copyright',
      'opdrag': 'dedication',
      'opsomming': 'abstract'}
"""Afrikaans (lowcased) to canonical name mapping for bibliographic fields."""

author_separators = [';', ',']
"""List of separator strings for the 'Authors' bibliographic field. Tried in
order."""
