// <copyright file="FunctionDeclaration.cs" company="WebDriver Committers">
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
