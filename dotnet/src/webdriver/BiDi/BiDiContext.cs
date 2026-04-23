// <copyright file="BiDiContext.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi;

internal sealed class BiDiContext
{
    private static readonly AsyncLocal<BiDiContext?> _current = new();

    internal static BiDiContext Current => _current.Value
        ?? throw new InvalidOperationException("No BiDiContext is available in the current context. Ensure the operation is performed within a BiDiContext.Use() scope.");

    internal IBiDi BiDi { get; }

    private BiDiContext(IBiDi bidi)
    {
        BiDi = bidi;
    }

    internal static Scope Use(IBiDi bidi)
    {
        var previous = _current.Value;
        _current.Value = new BiDiContext(bidi);
        return new Scope(previous);
    }

    internal readonly struct Scope : IDisposable
    {
        private readonly BiDiContext? _previous;

        internal Scope(BiDiContext? previous)
        {
            _previous = previous;
        }

        public void Dispose()
        {
            _current.Value = _previous;
        }
    }
}
