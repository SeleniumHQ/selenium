using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// A mechanism for taking a single method from a script meant for Selenium Core
    /// and converting to something that webdriver can evaluate.
    /// </summary>
    public interface IScriptMutator
    {
        /// <summary>
        /// Mutate a script. The original, unmodified script is used to generate a
        /// script on the StringBuilder, the "ToString" method of which should be
        /// used to get the result. We make use of a StringBuilder rather than a
        /// normal String so that we can efficiently chain mutators.
        /// </summary>
        /// <param name="script">The original script.</param>
        /// <param name="outputTo">The mutated script</param>
        void Mutate(string script, StringBuilder outputTo);
    }
}
