// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

goog.module('webdriver.print_options');
goog.module.declareLegacyNamespace();


/**
 * Represents the orientation of the page in the printed document.
 * @enum {string}
 */
const PrintOrientation = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape'
};

/**
 * Represents a page size for printing.
 */
class PageSize {
    constructor(width, height) {
      if (width <= 0 || height <= 0) {
        throw new Error('Page size dimensions must be positive.');
      }
      this.width = width;
      this.height = height;
    }
  
    static get A4() {
      return new PageSize(21.0, 29.7);
    }
  
    static get Letter() {
      return new PageSize(21.59, 27.94);
    }
  
    static get Legal() {
      return new PageSize(21.59, 35.56);
    }
  
    static get Tabloid() {
      return new PageSize(27.94, 43.18);
    }
  }

  /**
 * Represents margins for the printed document.
 */
class Margins {
    constructor(top, right, bottom, left) {
      if ([top, right, bottom, left].some(value => value < 0)) {
        throw new Error('Margins cannot have negative values.');
      }
      this.top = top;
      this.right = right;
      this.bottom = bottom;
      this.left = left;
    }
  
    static get Default() {
      return new Margins(1.0, 1.0, 1.0, 1.0);
    }
  }



/**
 * Represents the options to send for printing a page.
 */
class PrintOptions {
  /**
   * Initializes a new instance of the PrintOptions class.
   */
  constructor() {
    this.orientation = PrintOrientation.PORTRAIT;
    this.scale = 1.0;
    this.background = false;
    this.shrinkToFit = true;
    this.page = PrintOptions.PaperSize.A4;
    this.margin = PrintOptions.DefaultMargins;
    this.pageRanges = [];
  }

  /**
   * Predefined paper sizes.
   */
  static get PaperSize() {
    return {
      A4: { width: 21.0, height: 29.7 },
      LETTER: { width: 21.59, height: 27.94 },
      LEGAL: { width: 21.59, height: 35.56 },
      TABLOID: { width: 27.94, height: 43.18 }
    };
  }

  /**
   * Default margins.
   */
  static get DefaultMargins() {
    return { top: 1.0, bottom: 1.0, left: 1.0, right: 1.0 };
  }

  /**
   * Sets the orientation of the printed document.
   * @param {string} orientation - Must be either "portrait" or "landscape".
   */
  setOrientation(orientation) {
    if (!Object.values(PrintOrientation).includes(orientation)) {
      throw new Error(`Invalid orientation: ${orientation}`);
    }
    this.orientation = orientation;
  }

  /**
   * Sets the scale factor for the printed document.
   * @param {number} scale - Must be between 0.1 and 2.0.
   */
  setScale(scale) {
    if (scale < 0.1 || scale > 2.0) {
      throw new Error('Scale factor must be between 0.1 and 2.0.');
    }
    this.scale = scale;
  }

  /**
   * Sets the page size for the printed document.
   * @param {{ width: number, height: number }} pageSize - The page size object.
   */
  setPageSize(pageSize) {
    if (!pageSize || pageSize.width <= 0 || pageSize.height <= 0) {
      throw new Error('Invalid page size dimensions.');
    }
    this.page = pageSize;
  }

  /**
   * Sets the margins for the printed document.
   * @param {{ top: number, bottom: number, left: number, right: number }} margins - The margins object.
   */
  setMargins(margins) {
    if (!margins || margins.top < 0 || margins.bottom < 0 || margins.left < 0 || margins.right < 0) {
      throw new Error('Margins cannot have negative values.');
    }
    this.margin = margins;
  }

  /**
   * Adds a range of pages to print.
   * @param {string} range - The range in the form "x-y".
   */
  addPageRange(range) {
    if (!range || !/^\d+(-\d+)?$/.test(range)) {
      throw new Error(`Invalid page range: ${range}`);
    }
    if (this.pageRanges.includes(range)) {
      throw new Error(`Page range "${range}" is already added.`);
    }
    this.pageRanges.push(range);
  }

  /**
   * Serializes the PrintOptions object to JSON for WebDriver.
   * @returns {object} The JSON representation of the PrintOptions object.
   */
  toDictionary() {
    return {
      orientation: this.orientation,
      scale: this.scale,
      page: { width: this.pageSize.width, height: this.pageSize.height },
      margin: {
        top: this.margins.top,
        right: this.margins.right,
        bottom: this.margins.bottom,
        left: this.margins.left,
      },
      pageRanges: this.pageRanges,
    };
  }
}

export { PrintOptions, PrintOrientation, PageSize, Margins };


