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
package org.openqa.selenium.devtools.page.model;

import org.openqa.selenium.Beta;
import org.openqa.selenium.json.JsonInput;

/**
 * Generic font families collection.EXPERIMENTAL
 */
@Beta
public class FontFamilies {

  /**
   * The standard font-family.
   */
  private final String standard;
  /**
   * The fixed font-family.
   */
  private final String fixed;
  /**
   * The serif font-family.
   */
  private final String serif;
  /**
   * The sansSerif font-family.
   */
  private final String sansSerif;
  /**
   * The cursive font-family.
   */
  private final String cursive;
  /**
   * The fantasy font-family.
   */
  private final String fantasy;
  /**
   * The pictograph font-family.
   */
  private final String pictograph;

  public FontFamilies(
      String standard,
      String fixed,
      String serif,
      String sansSerif,
      String cursive,
      String fantasy,
      String pictograph) {
    this.standard = standard;
    this.fixed = fixed;
    this.serif = serif;
    this.sansSerif = sansSerif;
    this.cursive = cursive;
    this.fantasy = fantasy;
    this.pictograph = pictograph;
  }

  private static FontFamilies fromJson(JsonInput input) {
    String standard = null,
        fixed = null,
        serif = null,
        sansSerif = null,
        cursive = null,
        fantasy = null,
        pictograph = null;
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "standard":
          standard = input.nextString();
          break;
        case "fixed":
          fixed = input.nextString();
          break;
        case "serif":
          serif = input.nextString();
          break;
        case "sansSerif":
          sansSerif = input.nextString();
          break;
        case "cursive":
          cursive = input.nextString();
          break;
        case "fantasy":
          fantasy = input.nextString();
          break;
        case "pictograph":
          pictograph = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new FontFamilies(standard, fixed, serif, sansSerif, cursive, fantasy, pictograph);
  }
}
