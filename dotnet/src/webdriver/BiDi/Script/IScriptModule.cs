// <copyright file="IScriptModule.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Script;

public interface IScriptModule
{
    Task<AddPreloadScriptResult> AddPreloadScriptAsync([StringSyntax("javascript")] string functionDeclaration, AddPreloadScriptOptions? options = null, CancellationToken cancellationToken = default);
    Task<EvaluateResult> CallFunctionAsync([StringSyntax("javascript")] string functionDeclaration, bool awaitPromise, Target target, CallFunctionOptions? options = null, CancellationToken cancellationToken = default);
    Task<TResult?> CallFunctionAsync<TResult>([StringSyntax("javascript")] string functionDeclaration, bool awaitPromise, Target target, CallFunctionOptions? options = null, CancellationToken cancellationToken = default);
    Task<DisownResult> DisownAsync(IEnumerable<Handle> handles, Target target, DisownOptions? options = null, CancellationToken cancellationToken = default);
    Task<EvaluateResult> EvaluateAsync([StringSyntax("javascript")] string expression, bool awaitPromise, Target target, EvaluateOptions? options = null, CancellationToken cancellationToken = default);
    Task<TResult?> EvaluateAsync<TResult>([StringSyntax("javascript")] string expression, bool awaitPromise, Target target, EvaluateOptions? options = null, CancellationToken cancellationToken = default);
    Task<GetRealmsResult> GetRealmsAsync(GetRealmsOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnMessageAsync(Func<MessageEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnMessageAsync(Action<MessageEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnRealmCreatedAsync(Func<RealmCreatedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnRealmCreatedAsync(Action<RealmCreatedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnRealmDestroyedAsync(Func<RealmDestroyedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnRealmDestroyedAsync(Action<RealmDestroyedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<RemovePreloadScriptResult> RemovePreloadScriptAsync(PreloadScript script, RemovePreloadScriptOptions? options = null, CancellationToken cancellationToken = default);
}
