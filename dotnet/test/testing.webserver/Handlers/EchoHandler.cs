// <copyright file="EchoHandler.cs" company="Selenium Committers">
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

using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace OpenQA.Selenium.Testing.WebServer.Handlers;

public static class EchoHandler
{
    public static async Task<IResult> Handle(HttpContext context)
    {
        var request = context.Request;

        string method = request.Method;

        var headersBuilder = new StringBuilder();
        foreach (var header in request.Headers)
        {
            foreach (var value in header.Value)
            {
                headersBuilder.AppendFormat("<tr><td>{0}</td><td>{1}</td></tr>", header.Key, value);
            }
        }

        string body = string.Empty;
        using (var reader = new StreamReader(request.Body, Encoding.UTF8))
        {
            body = await reader.ReadToEndAsync();
        }

        string html = $"""
            <html><head><title>Done</title></head><body>
            <h1>Method: <span id='method'>{method}</span></h1>
            <h1>Headers</h1><table id='headers'><tbody>{headersBuilder}</tbody></table>
            <h1>Body:</h1><pre>{body}</pre>
            </body></html>
            """;

        context.Response.Headers.CacheControl = "no-cache";
        context.Response.Headers.Pragma = "no-cache";
        context.Response.Headers.Expires = "0";

        return Results.Content(html, "text/html; charset=utf-8");
    }
}
