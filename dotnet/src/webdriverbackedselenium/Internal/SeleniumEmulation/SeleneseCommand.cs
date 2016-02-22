// <copyright file="SeleneseCommand.cs" company="WebDriver Committers">
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

using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the base class for a command.
    /// </summary>
    internal abstract class SeleneseCommand
    {
        /// <summary>
        /// Applies the arguments to the command.
        /// </summary>
        /// <param name="driver">The driver to use in executing the command.</param>
        /// <param name="args">The command arguments.</param>
        /// <returns>The result of the command.</returns>
        internal object Apply(IWebDriver driver, string[] args)
        {
            switch (args.Length)
            {
                case 0:
                    return this.HandleSeleneseCommand(driver, null, null);

                case 1:
                    return this.HandleSeleneseCommand(driver, args[0], null);

                case 2:
                    return this.HandleSeleneseCommand(driver, args[0], args[1]);

                default:
                    throw new SeleniumException("Too many arguments! " + args.Length);
            }
        }

        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected abstract object HandleSeleneseCommand(IWebDriver driver, string locator, string value);
    }
}
