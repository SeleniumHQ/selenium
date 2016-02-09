// <copyright file="CompoundMutator.cs" company="WebDriver Committers">
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

using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// A class that collects together a group of other mutators and applies
    /// them in the order they've been added to any script that needs modification.
    /// Any JS to be executed will be wrapped in an "eval" block so that a
    /// meaningful return value can be created.
    /// </summary>
    public class CompoundMutator : IScriptMutator
    {
        private List<IScriptMutator> mutators = new List<IScriptMutator>();

        /// <summary>
        /// Initializes a new instance of the <see cref="CompoundMutator"/> class.
        /// </summary>
        /// <param name="basePath">The URL to use in mutating the script.</param>
        public CompoundMutator(string basePath)
        {
            this.AddMutator(new VariableDeclaration("selenium", "var selenium = {};"));
            this.AddMutator(new VariableDeclaration("selenium.browserbot", "selenium.browserbot = {};"));
            this.AddMutator(new VariableDeclaration("selenium.browserbot.baseUrl", "selenium.browserbot.baseUrl = '" + basePath + "';"));

            this.AddMutator(new FunctionDeclaration("selenium.page", "if (!selenium.browserbot) { selenium.browserbot = {} }; return selenium.browserbot;"));
            this.AddMutator(new FunctionDeclaration("selenium.browserbot.getCurrentWindow", "return window;"));
            this.AddMutator(new FunctionDeclaration("selenium.page().getCurrentWindow", "return window;"));
            this.AddMutator(new FunctionDeclaration("selenium.browserbot.getDocument", "return document;"));
            this.AddMutator(new FunctionDeclaration("selenium.page().getDocument", "return document;"));

            this.AddMutator(new SeleniumMutator("selenium.isElementPresent", JavaScriptLibrary.GetSeleniumScript("isElementPresent.js")));
            this.AddMutator(new SeleniumMutator("selenium.isTextPresent", JavaScriptLibrary.GetSeleniumScript("isTextPresent.js")));
            this.AddMutator(new SeleniumMutator("selenium.isVisible", JavaScriptLibrary.GetSeleniumScript("isVisible.js")));
            this.AddMutator(new SeleniumMutator("selenium.browserbot.findElement", JavaScriptLibrary.GetSeleniumScript("findElement.js")));
        }

        #region IScriptMutator Members
        /// <summary>
        /// Mutate a script so by calling all component mutators on it in turn.
        /// The original, unmodified script is used to generate a script
        /// on the StringBuilder, the "ToString" method of which should be
        /// used to get the result. We make use of a StringBuilder rather than a
        /// normal String so that we can efficiently chain mutators.
        /// </summary>
        /// <param name="script">The original script.</param>
        /// <param name="outputTo">The mutated script.</param>
        public void Mutate(string script, StringBuilder outputTo)
        {
            StringBuilder nested = new StringBuilder();
            foreach (IScriptMutator mutator in this.mutators)
            {
                mutator.Mutate(script, nested);
            }

            nested.Append(script);

            if (outputTo != null)
            {
                outputTo.Append("return eval('");
                outputTo.Append(Escape(nested.ToString()));
                outputTo.Append("');");
            }
        }
        #endregion

        /// <summary>
        /// Adds a mutator to the collection
        /// </summary>
        /// <param name="mutator">The <see cref="IScriptMutator"/> to add.</param>
        internal void AddMutator(IScriptMutator mutator)
        {
            this.mutators.Add(mutator);
        }

        private static string Escape(string escapee)
        {
            return escapee.Replace("\\", "\\\\").Replace("\n", "\\n").Replace("'", "\\'");
        }
    }
}
