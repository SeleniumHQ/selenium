// <copyright file="TableElement.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;
using System.Collections.Generic;
using System.Linq;

namespace OpenQA.Selenium.Support.UI
{
  /// <summary>
  ///   Wraps an IWebElement into a user-friendly table-element
  /// </summary>
  public class TableElement
  {
    private readonly IWebElement table;

    /// <summary>
    ///   Initializes a new instance of the <see cref="TableElement" /> class.
    /// </summary>
    /// <param name="table">The IWebElement that is wrapped</param>
    public TableElement(IWebElement table)
    {
      CheckType(table);
      this.table = table;
    }

    /// <summary>
    ///   The caption of the table
    /// </summary>
    public IWebElement Caption => this.Section("caption");

    /// <summary>
    ///   The table rows in the header section
    /// </summary>
    public IList<TableRowElement> HeaderRows => TheRows(this.Section("thead"));

    /// <summary>
    ///   The table rows in the footer section
    /// </summary>
    public IList<TableRowElement> FooterRows => TheRows(this.Section("tfoot"));

    /// <summary>
    ///   The table rows in the body section
    /// </summary>
    public IList<TableRowElement> BodyRows => TheRows(this.Section("tbody"));

    /// <summary>
    ///   The table rows in the entire table (any section)
    /// </summary>
    public IList<TableRowElement> Rows => TheRows(this.table);

    private IWebElement Section(string tagName)
    {
      return this.table.FindElement(By.TagName(tagName));
    }

    private static void CheckType(IWebElement webElement)
    {
      if (!webElement.TagName.Equals("table"))
      {
        throw new NotTableElementException(webElement.TagName);
      }
    }

    private static IList<TableRowElement> TheRows(IWebElement parentElement)
    {
      var webElements = parentElement.FindElements(By.TagName("tr"));
      var list = new List<TableRowElement>(webElements.Count);
      list.AddRange(webElements.Select(webElement => new TableRowElement(webElement)));
      return list;
    }
  }
}
