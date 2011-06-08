using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// A mechanism for taking a function declaration from a script meant for Selenium Core
    /// and converting to something that webdriver can evaluate.
    /// </summary>
    public class FunctionDeclaration : IScriptMutator
    {
        private Regex pattern;
        private string function;

        /// <summary>
        /// Initializes a new instance of the <see cref="FunctionDeclaration"/> class.
        /// </summary>
        /// <param name="raw">The raw term to mutate.</param>
        /// <param name="result">The result to which to set the term.</param>
        public FunctionDeclaration(string raw, string result)
        {
            if (raw == null)
            {
                raw = string.Empty;
            }

            string baseString = raw.Replace(".", "\\s*\\.\\s*");
            this.pattern = new Regex(".*" + baseString + "\\s*\\(\\s*\\).*");
            this.function = raw + " = function() { " + result + " }; ";
        }

        #region IScriptMutator Members
        /// <summary>
        /// Mutate a script so that function declarations have the correct scope.
        /// The original, unmodified script is used to generate a script
        /// on the StringBuilder, the "ToString" method of which should be
        /// used to get the result. We make use of a StringBuilder rather than a
        /// normal String so that we can efficiently chain mutators.
        /// </summary>
        /// <param name="script">The original script.</param>
        /// <param name="outputTo">The mutated script.</param>
        public void Mutate(string script, StringBuilder outputTo)
        {
            if (outputTo == null || !this.pattern.IsMatch(script))
            {
                return;
            }

            outputTo.Append(this.function);
        }

        #endregion
    }
}
