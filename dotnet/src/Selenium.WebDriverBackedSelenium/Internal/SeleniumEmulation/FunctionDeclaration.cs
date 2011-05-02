using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace Selenium.Internal.SeleniumEmulation
{
    public class FunctionDeclaration : IScriptMutator
    {
        private Regex pattern;
        private string function;

        public FunctionDeclaration(string raw, string result)
        {
            string baseString = raw.Replace(".", "\\s*\\.\\s*");
            pattern = new Regex(".*" + baseString + "\\s*\\(\\s*\\).*");
            function = raw + " = function() { " + result + " }; ";
        }

        #region IScriptMutator Members

        public void Mutate(string script, StringBuilder outputTo)
        {
            if (!pattern.IsMatch(script))
            {
                return;
            }

            outputTo.Append(function);
        }

        #endregion
    }
}
