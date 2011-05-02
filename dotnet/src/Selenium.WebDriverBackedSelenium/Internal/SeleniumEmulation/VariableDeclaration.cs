using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace Selenium.Internal.SeleniumEmulation
{
    public class VariableDeclaration : IScriptMutator
    {
        private Regex pattern;
        private string declaration;

        public VariableDeclaration(string raw, string declaration)
        {
            this.declaration = declaration;
            raw = raw.Replace(".", "\\s*\\.\\s*")
                .Replace("(", "\\(")
                .Replace(")", "\\)");

            pattern = new Regex(".*" + raw + ".*");
        }

        #region IScriptMutator Members

        public void Mutate(string script, StringBuilder outputTo)
        {
            if (!pattern.IsMatch(script))
            {
                return;
            }

            outputTo.Append(declaration);
        }

        #endregion
    }
}
