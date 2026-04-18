// <copyright file="ArgumentNullExceptionExtensions.cs" company="Selenium Committers">
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

using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;

#pragma warning disable IDE0130 // Namespace does not match folder structure
namespace System;
#pragma warning restore IDE0130 // Namespace does not match folder structure

// Polyfill: ArgumentNullException.ThrowIfNull is available starting with .NET 7,
// but the caller argument expression support requires .NET 8+.
#if !NET8_0_OR_GREATER
internal static class ArgumentNullExceptionExtensions
{
    extension(ArgumentNullException)
    {
        /// <summary>
        /// Throws an <see cref="ArgumentNullException"/> if <paramref name="arg"/> is <see langword="null"/>.
        /// </summary>
        /// <param name="arg">The argument to validate as non-null.</param>
        /// <param name="paramName">The name of the parameter with which <paramref name="arg"/> corresponds.</param>
        /// <exception cref="ArgumentNullException"><paramref name="arg"/> is <see langword="null"/>.</exception>
        public static void ThrowIfNull([NotNull] object? arg, [CallerArgumentExpression(nameof(arg))] string paramName = "")
        {
            if (arg is null)
            {
                throw new ArgumentNullException(paramName);
            }
        }
    }
}
#endif
