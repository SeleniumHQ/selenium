// <copyright file="NetworkEvent.cs" company="Selenium Committers">
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

using static OpenQA.Selenium.BiDi.Network.NetworkJsonSerializerContext;

namespace OpenQA.Selenium.BiDi.Network;

public static class NetworkEvent
{
    public static EventDescriptor<BeforeRequestSentEventArgs> BeforeRequestSent { get; } = EventDescriptor<BeforeRequestSentEventArgs>.Create<BeforeRequestSentParameters>(
        "network.beforeRequestSent",
        static (bidi, p) => new BeforeRequestSentEventArgs(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.Initiator, p.UserContext, p.Intercepts),
        Default.BeforeRequestSentParameters);

    public static EventDescriptor<ResponseStartedEventArgs> ResponseStarted { get; } = EventDescriptor<ResponseStartedEventArgs>.Create<ResponseStartedParameters>(
        "network.responseStarted",
        static (bidi, p) => new ResponseStartedEventArgs(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.Response, p.UserContext, p.Intercepts),
        Default.ResponseStartedParameters);

    public static EventDescriptor<ResponseCompletedEventArgs> ResponseCompleted { get; } = EventDescriptor<ResponseCompletedEventArgs>.Create<ResponseCompletedParameters>(
        "network.responseCompleted",
        static (bidi, p) => new ResponseCompletedEventArgs(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.Response, p.UserContext, p.Intercepts),
        Default.ResponseCompletedParameters);

    public static EventDescriptor<FetchErrorEventArgs> FetchError { get; } = EventDescriptor<FetchErrorEventArgs>.Create<FetchErrorParameters>(
        "network.fetchError",
        static (bidi, p) => new FetchErrorEventArgs(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.ErrorText, p.UserContext, p.Intercepts),
        Default.FetchErrorParameters);

    public static EventDescriptor<AuthRequiredEventArgs> AuthRequired { get; } = EventDescriptor<AuthRequiredEventArgs>.Create<AuthRequiredParameters>(
        "network.authRequired",
        static (bidi, p) => new AuthRequiredEventArgs(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.UserContext, p.Intercepts, p.Response),
        Default.AuthRequiredParameters);
}
