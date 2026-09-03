// <copyright file="FedCmHandler.cs" company="Selenium Committers">
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

using Microsoft.AspNetCore.Http;

namespace OpenQA.Selenium.Testing.WebServer.Handlers;

public static class FedCmHandler
{
    public static IResult HandleWebIdentity(HttpContext context)
    {
        context.Response.Headers.CacheControl = "no-store";

        return Results.Json(new { provider_urls = new[] { "https://idp.com" } });
    }

    public static IResult HandleConfig(HttpContext context)
    {
        context.Response.Headers.CacheControl = "no-store";

        return Results.Json(new
        {
            accounts_endpoint = "accounts.json",
            client_metadata_endpoint = "client_metadata.json",
            id_assertion_endpoint = "id_assertion.json",
            signin_url = "signin",
            login_url = "login"
        });
    }

    public static IResult HandleIdAssertion(HttpContext context)
    {
        context.Response.Headers.CacheControl = "no-store";

        return Results.Json(new { token = "a token" });
    }
}
