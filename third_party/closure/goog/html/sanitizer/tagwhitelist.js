// Copyright 2016 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview Contains the tag whitelist for use in the Html sanitizer.
 */

goog.provide('goog.html.sanitizer.TagWhitelist');


/**
 * A tag whitelist for allowed tags. Tag names must be in all caps.
 * @const @dict {boolean}
 */
goog.html.sanitizer.TagWhitelist = {
  'A': true,           // HTMLAnchorElement
  'ABBR': true,        // HTMLElement
  'ACRONYM': true,     // HTMLElement
  'ADDRESS': true,     // HTMLElement
  'AREA': true,        // HTMLAreaElement
  'ARTICLE': true,     // HTMLElement
  'ASIDE': true,       // HTMLElement
  'B': true,           // HTMLElement
  'BDI': true,         // HTMLElement
  'BDO': true,         // HTMLElement
  'BIG': true,         // HTMLElement
  'BLOCKQUOTE': true,  // HTMLQuoteElement
  'BR': true,          // HTMLBRElement
  'BUTTON': true,      // HTMLButtonElement
  'CAPTION': true,     // HTMLTableCaptionElement
  'CENTER': true,      // HTMLElement
  'CITE': true,        // HTMLElement
  'CODE': true,        // HTMLElement
  'COL': true,         // HTMLTableColElement
  'COLGROUP': true,    // HTMLTableColElement
  'DATA': true,        // HTMLElement
  'DATALIST': true,    // HTMLDataListElement
  'DD': true,          // HTMLElement
  'DEL': true,         // HTMLModElement
  'DETAILS': true,     // HTMLDetailsElement
  'DFN': true,         // HTMLElement
  'DIALOG': true,      // HTMLDialogElement
  'DIR': true,         // HTMLDirectoryElement
  'DIV': true,         // HTMLDivElement
  'DL': true,          // HTMLDListElement
  'DT': true,          // HTMLElement
  'EM': true,          // HTMLElement
  'FIELDSET': true,    // HTMLFieldSetElement
  'FIGCAPTION': true,  // HTMLElement
  'FIGURE': true,      // HTMLElement
  'FONT': true,        // HTMLFontElement
  'FOOTER': true,      // HTMLElement
  // Disallowed by default via tagBlacklist unless allowed via the builder.
  'FORM': true,      // HTMLFormElement
  'H1': true,        // HTMLHeadingElement
  'H2': true,        // HTMLHeadingElement
  'H3': true,        // HTMLHeadingElement
  'H4': true,        // HTMLHeadingElement
  'H5': true,        // HTMLHeadingElement
  'H6': true,        // HTMLHeadingElement
  'HEADER': true,    // HTMLElement
  'HGROUP': true,    // HTMLElement
  'HR': true,        // HTMLHRElement
  'I': true,         // HTMLElement
  'IMG': true,       // HTMLImageElement
  'INPUT': true,     // HTMLInputElement
  'INS': true,       // HTMLModElement
  'KBD': true,       // HTMLElement
  'LABEL': true,     // HTMLLabelElement
  'LEGEND': true,    // HTMLLegendElement
  'LI': true,        // HTMLLIElement
  'MAIN': true,      // HTMLElement
  'MAP': true,       // HTMLMapElement
  'MARK': true,      // HTMLElement
  'MENU': true,      // HTMLMenuElement
  'METER': true,     // HTMLMeterElement
  'NAV': true,       // HTMLElement
  'NOSCRIPT': true,  // HTMLElement
  'OL': true,        // HTMLOListElement
  'OPTGROUP': true,  // HTMLOptGroupElement
  'OPTION': true,    // HTMLOptionElement
  'OUTPUT': true,    // HTMLOutputElement
  'P': true,         // HTMLParagraphElement
  'PRE': true,       // HTMLPreElement
  'PROGRESS': true,  // HTMLProgressElement
  'Q': true,         // HTMLQuoteElement
  'S': true,         // HTMLElement
  'SAMP': true,      // HTMLElement
  'SECTION': true,   // HTMLElement
  'SELECT': true,    // HTMLSelectElement
  'SMALL': true,     // HTMLElement
  'SOURCE': true,    // HTMLSourceElement
  'SPAN': true,      // HTMLSpanElement
  'STRIKE': true,    // HTMLElement
  'STRONG': true,    // HTMLElement
  'SUB': true,       // HTMLElement
  'SUMMARY': true,   // HTMLElement
  'SUP': true,       // HTMLElement
  'TABLE': true,     // HTMLTableElement
  'TBODY': true,     // HTMLTableSectionElement
  'TD': true,        // HTMLTableDataCellElement
  'TEXTAREA': true,  // HTMLTextAreaElement
  'TFOOT': true,     // HTMLTableSectionElement
  'TH': true,        // HTMLTableHeaderCellElement
  'THEAD': true,     // HTMLTableSectionElement
  'TIME': true,      // HTMLTimeElement
  'TR': true,        // HTMLTableRowElement
  'TT': true,        // HTMLElement
  'U': true,         // HTMLElement
  'UL': true,        // HTMLUListElement
  'VAR': true,       // HTMLElement
  'WBR': true        // HTMLElement
};
