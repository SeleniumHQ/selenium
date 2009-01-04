# Author: Nicola Larosa, Lele Gaifax
# Contact: docutils@tekNico.net, lele@seldati.it
# Revision: $Revision: 4229 $
# Date: $Date: 2005-12-23 00:46:16 +0100 (Fri, 23 Dec 2005) $
# Copyright: This module has been placed in the public domain.

# Beware: the italian translation of the reStructuredText documentation
# at http://docit.bice.dyndns.org/static/ReST, in particular
# http://docit.bice.dyndns.org/static/ReST/ref/rst/directives.html, needs
# to be synced with the content of this file.

"""
Italian-language mappings for language-dependent features of
reStructuredText.
"""

__docformat__ = 'reStructuredText'


directives = {
      'attenzione': 'attention',
      'cautela': 'caution',
      'pericolo': 'danger',
      'errore': 'error',
      'suggerimento': 'hint',
      'importante': 'important',
      'nota': 'note',
      'consiglio': 'tip',
      'avvertenza': 'warning',
      'ammonizione': 'admonition',
      'riquadro': 'sidebar',
      'argomento': 'topic',
      'blocco-di-righe': 'line-block',
      'blocco-interpretato': 'parsed-literal',
      'rubrica': 'rubric',
      'epigrafe': 'epigraph',
      'punti-salienti': 'highlights',
      'estratto-evidenziato': 'pull-quote',
      'composito': 'compound',
      u'container (translation required)': 'container',
      #'questions': 'questions',
      #'qa': 'questions',
      #'faq': 'questions',
      'tabella': 'table',
      'tabella-csv': 'csv-table',
      'tabella-elenco': 'list-table',
      'meta': 'meta',
      #'imagemap': 'imagemap',
      'immagine': 'image',
      'figura': 'figure',
      'includi': 'include',
      'grezzo': 'raw',
      'sostituisci': 'replace',
      'unicode': 'unicode',
      'data': 'date',
      'classe': 'class',
      'ruolo': 'role',
      'ruolo-predefinito': 'default-role',
      'titolo': 'title',
      'indice': 'contents',
      'contenuti': 'contents',
      'seznum': 'sectnum',
      'sezioni-autonumerate': 'sectnum',
      'annota-riferimenti-esterni': 'target-notes',
      'intestazione': 'header',
      'piede-pagina': 'footer',
      #'footnotes': 'footnotes',
      #'citations': 'citations',
      'restructuredtext-test-directive': 'restructuredtext-test-directive'}
"""Italian name to registered (in directives/__init__.py) directive name
mapping."""

roles = {
      'abbreviazione': 'abbreviation',
      'acronimo': 'acronym',
      'indice': 'index',
      'deponente': 'subscript',
      'esponente': 'superscript',
      'riferimento-titolo': 'title-reference',
      'riferimento-pep': 'pep-reference',
      'riferimento-rfc': 'rfc-reference',
      'enfasi': 'emphasis',
      'forte': 'strong',
      'letterale': 'literal',
      'riferimento-con-nome': 'named-reference',
      'riferimento-anonimo': 'anonymous-reference',
      'riferimento-nota': 'footnote-reference',
      'riferimento-citazione': 'citation-reference',
      'riferimento-sostituzione': 'substitution-reference',
      'destinazione': 'target',
      'riferimento-uri': 'uri-reference',
      'grezzo': 'raw',}
"""Mapping of Italian role names to canonical role names for interpreted text.
"""
