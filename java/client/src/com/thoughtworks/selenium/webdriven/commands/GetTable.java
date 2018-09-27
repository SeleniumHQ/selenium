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

package com.thoughtworks.selenium.webdriven.commands;

import com.thoughtworks.selenium.SeleniumException;
import com.thoughtworks.selenium.webdriven.ElementFinder;
import com.thoughtworks.selenium.webdriven.JavascriptLibrary;
import com.thoughtworks.selenium.webdriven.SeleneseCommand;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class GetTable extends SeleneseCommand<String> {
  private static final Pattern TABLE_PARTS = Pattern.compile("(.*)\\.(\\d+)\\.(\\d+)");
  private final ElementFinder finder;
  private final JavascriptLibrary js;

  public GetTable(ElementFinder finder, JavascriptLibrary js) {
    this.finder = finder;
    this.js = js;
  }

  @Override
  protected String handleSeleneseCommand(WebDriver driver, String tableCellAddress, String ignored) {
    Matcher matcher = TABLE_PARTS.matcher(tableCellAddress);
    if (!matcher.matches()) {
      throw new SeleniumException(
          "Invalid target format. Correct format is tableName.rowNum.columnNum");
    }

    String tableName = matcher.group(1);
    long row = Long.parseLong(matcher.group(2));
    long col = Long.parseLong(matcher.group(3));

    WebElement table = finder.findElement(driver, tableName);

    String script =
        "var table = arguments[0]; var row = arguments[1]; var col = arguments[2];" +
        "if (row > table.rows.length) { return \"Cannot access row \" + row + \" - table has \" + table.rows.length + \" rows\"; }" +
        "if (col > table.rows[row].cells.length) { return \"Cannot access column \" + col + \" - table row has \" + table.rows[row].cells.length + \" columns\"; }" +
        "return table.rows[row].cells[col];";

    Object value = js.executeScript(driver, script, table, row, col);
    if (value instanceof WebElement) {
      return ((WebElement) value).getText().trim();
    }

    throw new SeleniumException((String) value);
  }
}
