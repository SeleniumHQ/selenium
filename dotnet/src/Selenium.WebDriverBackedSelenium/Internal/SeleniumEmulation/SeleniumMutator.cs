using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// A mechanism for taking a script meant for Selenium Core
    /// and converting to something that webdriver can evaluate.
    /// </summary>
    public class SeleniumMutator : IScriptMutator
    {
        private Regex pattern;
        private string method;
        private string atom;

        /// <summary>
        /// Initializes a new instance of the <see cref="SeleniumMutator"/> class.
        /// </summary>
        /// <param name="method">The name of the atom to mutate.</param>
        /// <param name="atom">The source code of the atom to execute.</param>
        public SeleniumMutator(string method, string atom)
        {
            if (method == null)
            {
                method = string.Empty;
            }

            string raw = ".*" + method.Replace(".", "\\s*\\.\\s*") + ".*";
            this.pattern = new Regex(raw);
            this.method = method;
            this.atom = atom;
        }

        #region IScriptMutator Members
        /// <summary>
        /// Mutate an atom script so that it has the correct scope.
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

            // Alias the raw atom and set "this" to be the pre-declared selenium object.
            outputTo.Append(string.Format(CultureInfo.InvariantCulture, @"{0} = function() {{ return ({1}).apply(null, arguments);}};", this.method, this.atom));
        }

        #endregion
    }
}
