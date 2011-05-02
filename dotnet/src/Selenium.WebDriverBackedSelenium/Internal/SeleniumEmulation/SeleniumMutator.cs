using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace Selenium.Internal.SeleniumEmulation
{
    public class SeleniumMutator : IScriptMutator
    {
        private Regex pattern;
        private string method;
        private string atom;

        public SeleniumMutator(string method, string atom)
        {
            string raw = ".*" + method.Replace(".", "\\s*\\.\\s*") + ".*";
            this.pattern = new Regex(raw);
            this.method = method;
            this.atom = atom;
        }

        #region IScriptMutator Members

        public void Mutate(string script, StringBuilder outputTo)
        {
            if (!pattern.IsMatch(script))
            {
                return;
            }

            // Alias the raw atom and set "this" to be the pre-declared selenium object.
            outputTo.Append(string.Format(@"{0} = function() {{ return ({1}).apply(null, arguments);}};", method, atom));
        }

        #endregion
    }
}
