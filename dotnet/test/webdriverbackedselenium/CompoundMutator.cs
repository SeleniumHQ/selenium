using System;
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
    internal class CompoundMutator : IScriptMutator
    {
        private List<IScriptMutator> mutators = new List<IScriptMutator>();

        public CompoundMutator(string baseUrl)
        {
            this.AddMutator(new VariableDeclaration("selenium", "var selenium = {};"));
            this.AddMutator(new VariableDeclaration("selenium.browserbot", "selenium.browserbot = {};"));
            this.AddMutator(new VariableDeclaration("selenium.browserbot.baseUrl", "selenium.browserbot.baseUrl = '" + baseUrl + "';"));

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

        public void Mutate(string script, StringBuilder outputTo)
        {
            StringBuilder nested = new StringBuilder();
            foreach (IScriptMutator mutator in mutators)
            {
                mutator.Mutate(script, nested);
            }

            nested.Append("").Append(script);

            outputTo.Append("return eval('");
            outputTo.Append(escape(nested.ToString()));
            outputTo.Append("');");
        }

        #endregion

        internal void AddMutator(IScriptMutator mutator)
        {
            this.mutators.Add(mutator);
        }

        private string escape(String escapee)
        {
            return escapee
                .Replace("\\", "\\\\")
                .Replace("\n", "\\n")
                .Replace("'", "\\'");
        }
    }
}
