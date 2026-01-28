// <copyright file="RegExpValue.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System;
using System.Diagnostics;
using System.Text.RegularExpressions;

namespace OpenQA.Selenium.BiDi.Script;

public sealed record RegExpValue(string Pattern)
{
    public string? Flags { get; set; }

    internal static string? GetRegExpFlags(RegexOptions options)
    {
        if (options == RegexOptions.None)
        {
            return null;
        }

        string flags = string.Empty;
        const RegexOptions NonBacktracking = (RegexOptions)1024;
#if NET8_0_OR_GREATER
        Debug.Assert(NonBacktracking == RegexOptions.NonBacktracking);
#endif
        const RegexOptions NonApplicableOptions = RegexOptions.Compiled | NonBacktracking;

        const RegexOptions UnsupportedOptions =
            RegexOptions.ExplicitCapture |
            RegexOptions.IgnorePatternWhitespace |
            RegexOptions.RightToLeft |
            RegexOptions.CultureInvariant;

        options &= ~NonApplicableOptions;
        if ((options & UnsupportedOptions) != 0)
        {
            throw new NotSupportedException($"The selected RegEx options are not supported in BiDi: {options & UnsupportedOptions}");
        }

        if ((options & RegexOptions.IgnoreCase) != 0)
        {
            flags += "i";
            options = options & ~RegexOptions.IgnoreCase;
        }

        if ((options & RegexOptions.Multiline) != 0)
        {
            options = options & ~RegexOptions.Multiline;
            flags += "m";
        }

        if ((options & RegexOptions.Singleline) != 0)
        {
            options = options & ~RegexOptions.Singleline;
            flags += "s";
        }

        Debug.Assert(options == RegexOptions.None);

        return flags;
    }
}
