// <copyright file="BrowsingContextScriptModule.cs" company="Selenium Committers">
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
using System.Threading;
using System.Threading.Tasks;
using OpenQA.Selenium.BiDi.Script;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public sealed class BrowsingContextScriptModule(BrowsingContext context, ScriptModule scriptModule)
{
    public Task<AddPreloadScriptResult> AddPreloadScriptAsync([StringSyntax(StringSyntaxConstants.JavaScript)] string functionDeclaration, ContextAddPreloadScriptOptions? options = null, CancellationToken cancellationToken = default)
    {
        return scriptModule.AddPreloadScriptAsync(functionDeclaration, ContextAddPreloadScriptOptions.WithContext(options, context), cancellationToken);
    }

    public Task<GetRealmsResult> GetRealmsAsync(ContextGetRealmsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return scriptModule.GetRealmsAsync(ContextGetRealmsOptions.WithContext(options, context), cancellationToken);
    }

    public Task<EvaluateResult> EvaluateAsync([StringSyntax(StringSyntaxConstants.JavaScript)] string expression, bool awaitPromise, EvaluateOptions? options = null, ContextTargetOptions? targetOptions = null, CancellationToken cancellationToken = default)
    {
        var contextTarget = new ContextTarget(context);

        if (targetOptions is not null)
        {
            contextTarget.Sandbox = targetOptions.Sandbox;
        }

        return scriptModule.EvaluateAsync(expression, awaitPromise, contextTarget, options, cancellationToken);
    }

    public async Task<TResult?> EvaluateAsync<TResult>([StringSyntax(StringSyntaxConstants.JavaScript)] string expression, bool awaitPromise, EvaluateOptions? options = null, ContextTargetOptions? targetOptions = null, CancellationToken cancellationToken = default)
    {
        var result = await EvaluateAsync(expression, awaitPromise, options, targetOptions, cancellationToken).ConfigureAwait(false);

        return result.AsSuccessResult().ConvertTo<TResult>();
    }

    public Task<EvaluateResult> CallFunctionAsync([StringSyntax(StringSyntaxConstants.JavaScript)] string functionDeclaration, bool awaitPromise, CallFunctionOptions? options = null, ContextTargetOptions? targetOptions = null, CancellationToken cancellationToken = default)
    {
        var contextTarget = new ContextTarget(context);

        if (targetOptions is not null)
        {
            contextTarget.Sandbox = targetOptions.Sandbox;
        }

        return scriptModule.CallFunctionAsync(functionDeclaration, awaitPromise, contextTarget, options, cancellationToken);
    }

    public async Task<TResult?> CallFunctionAsync<TResult>([StringSyntax(StringSyntaxConstants.JavaScript)] string functionDeclaration, bool awaitPromise, CallFunctionOptions? options = null, ContextTargetOptions? targetOptions = null, CancellationToken cancellationToken = default)
    {
        var result = await CallFunctionAsync(functionDeclaration, awaitPromise, options, targetOptions, cancellationToken).ConfigureAwait(false);

        return result.AsSuccessResult().ConvertTo<TResult>();
    }
}
