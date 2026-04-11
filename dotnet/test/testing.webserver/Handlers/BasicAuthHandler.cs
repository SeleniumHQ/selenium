// <copyright file="BasicAuthHandler.cs" company="Selenium Committers">
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
using System.Net;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace OpenQA.Selenium.Testing.WebServer.Handlers;

public static class BasicAuthHandler
{
    private const string ExpectedUser = "test";
    private const string ExpectedPassword = "test";

    public static IResult Handle(HttpContext context)
    {
        string? authorization = context.Request.Headers.Authorization;

        if (authorization is not null && authorization.StartsWith("Basic "))
        {
            string encoded = authorization["Basic ".Length..];
            string decoded = Encoding.UTF8.GetString(Convert.FromBase64String(encoded));
            string[] parts = decoded.Split(':', 2);

            if (parts.Length == 2 && parts[0] == ExpectedUser && parts[1] == ExpectedPassword)
            {
                return Results.Content("<h1>authorized</h1>", "text/html; charset=utf-8");
            }
        }

        context.Response.Headers["WWW-Authenticate"] = "Basic realm=\"selenium-server\"";
        return Results.Text(string.Empty, statusCode: (int)HttpStatusCode.Unauthorized,
            contentType: "text/html; charset=utf-8");
    }
}
