# -*- coding: utf-8 -*-
# Author: Panjunyong
# Contact: panjy@zopechina.com
# Revision: $Revision: 4237 $
# Date: $Date: 2006-01-01 03:35:00 +0100 (Sun, 01 Jan 2006) $
# Copyright: This module has been placed in the public domain.

# New language mappings are welcome.  Before doing a new translation, please
# read <http://docutils.sf.net/docs/howto/i18n.html>.  Two files must be
# translated for each language: one in docutils/languages, the other in
# docutils/parsers/rst/languages.

"""
Simplified Chinese language mappings for language-dependent features of
reStructuredText.
"""

__docformat__ = 'reStructuredText'


directives = {
      # language-dependent: fixed
      u'注意': 'attention',
      u'小心': 'caution',
      u'危险': 'danger',
      u'错误': 'error',
      u'提示': 'hint',
      u'重要': 'important',
      u'注解': 'note',
      u'技巧': 'tip',
      u'警告': 'warning',
      u'忠告': 'admonition',
      u'侧框': 'sidebar',
      u'主题': 'topic',
      u'line-block (translation required)': 'line-block',
      u'parsed-literal (translation required)': 'parsed-literal',
      u'醒目': 'rubric',
      u'铭文': 'epigraph',
      u'要点': 'highlights',
      u'pull-quote (translation required)': 'pull-quote',
      u'复合': 'compound',
      u'容器': 'container',
      #u'questions (translation required)': 'questions',
      u'表格': 'table',
      u'csv表格': 'csv-table',
      u'列表表格': 'list-table',
      #u'qa (translation required)': 'questions',
      #u'faq (translation required)': 'questions',
      u'元数据': 'meta',
      #u'imagemap (translation required)': 'imagemap',
      u'图片': 'image',
      u'图例': 'figure',
      u'包含': 'include',
      u'原文': 'raw',
      u'代替': 'replace',
      u'统一码': 'unicode',
      u'日期': 'date',
      u'类型': 'class',
      u'角色': 'role',
      u'默认角色': 'default-role',
      u'标题': 'title',
      u'目录': 'contents',
      u'章节序号': 'sectnum',
      u'题头': 'header',
      u'页脚': 'footer',
      #u'footnotes (translation required)': 'footnotes',
      #u'citations (translation required)': 'citations',
      u'target-notes (translation required)': 'target-notes',
      u'restructuredtext-test-directive': 'restructuredtext-test-directive'}
"""Simplified Chinese name to registered (in directives/__init__.py)
directive name mapping."""

roles = {
    # language-dependent: fixed
    u'缩写': 'abbreviation',
    u'简称': 'acronym',
    u'index (translation required)': 'index',
    u'i (translation required)': 'index',
    u'下标': 'subscript',
    u'上标': 'superscript',
    u'title-reference (translation required)': 'title-reference',
    u'title (translation required)': 'title-reference',
    u't (translation required)': 'title-reference',
    u'pep-reference (translation required)': 'pep-reference',
    u'pep (translation required)': 'pep-reference',
    u'rfc-reference (translation required)': 'rfc-reference',
    u'rfc (translation required)': 'rfc-reference',
    u'强调': 'emphasis',
    u'加粗': 'strong',
    u'字面': 'literal',
    u'named-reference (translation required)': 'named-reference',
    u'anonymous-reference (translation required)': 'anonymous-reference',
    u'footnote-reference (translation required)': 'footnote-reference',
    u'citation-reference (translation required)': 'citation-reference',
    u'substitution-reference (translation required)': 'substitution-reference',
    u'target (translation required)': 'target',
    u'uri-reference (translation required)': 'uri-reference',
    u'uri (translation required)': 'uri-reference',
    u'url (translation required)': 'uri-reference',
    u'raw (translation required)': 'raw',}
"""Mapping of Simplified Chinese role names to canonical role names
for interpreted text."""
