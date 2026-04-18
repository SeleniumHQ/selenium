// <copyright file="CookieHandler.cs" company="Selenium Committers">
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

public static class CookieHandler
{
    private const string ResponseFormat = "<html><head><title>Done</title></head><body>{0} : {1}</body></html>";

    public static IResult Handle(HttpContext context)
    {
        var request = context.Request;
        var response = context.Response;

        response.Headers.ContentType = "text/html";
        response.Headers.CacheControl = "no-cache";
        response.Headers.Pragma = "no-cache";
        response.Headers.Expires = "0";

        string? action = request.Query["action"];

        string html;

        if (action == "add")
        {
            string? name = request.Query["name"];
            string? value = request.Query["value"];
            string? domain = request.Query["domain"];
            string? path = request.Query["path"];
            string? expiry = request.Query["expiry"];
            string? secure = request.Query["secure"];
            string? httpOnly = request.Query["httpOnly"];

            var cookie = $"{name}={value}; ";

            if (!string.IsNullOrEmpty(domain)) cookie += $"Domain={domain}; ";
            if (!string.IsNullOrEmpty(path)) cookie += $"Path={path}; ";
            if (!string.IsNullOrEmpty(expiry)) cookie += $"Max-Age={expiry}; ";
            if (!string.IsNullOrEmpty(secure)) cookie += "Secure; ";
            if (!string.IsNullOrEmpty(httpOnly)) cookie += "HttpOnly; ";

            response.Headers.Append("Set-Cookie", cookie);

            html = string.Format(ResponseFormat, "Cookie added", name);
        }
        else if (action == "delete")
        {
            string? name = request.Query["name"];

            foreach (var cookiePair in request.Cookies)
            {
                if (cookiePair.Key != name) continue;

                response.Headers.Append("Set-Cookie", $"{name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
            }

            html = string.Format(ResponseFormat, "Cookie deleted", name);
        }
        else if (action == "deleteAll")
        {
            foreach (var cookiePair in request.Cookies)
            {
                response.Headers.Append("Set-Cookie", $"{cookiePair.Key}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
            }

            html = string.Format(ResponseFormat, "All cookies deleted", "");
        }
        else
        {
            html = string.Format(ResponseFormat, "Unrecognized action", action);
        }

        return Results.Content(html, "text/html; charset=utf-8");
    }
}
