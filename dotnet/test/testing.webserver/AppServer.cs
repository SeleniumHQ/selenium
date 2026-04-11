// <copyright file="AppServer.cs" company="Selenium Committers">
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
using System.Collections.Concurrent;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.FileProviders;
using OpenQA.Selenium.Testing.WebServer.Handlers;

namespace OpenQA.Selenium.Testing.WebServer;

public class AppServer(int port) : IAsyncDisposable
{
    private WebApplication? _app;
    private readonly string _webContentRoot = FindWebContentRoot();
    private readonly ConcurrentDictionary<string, string> _pages = new();

    public string BaseUrl => $"http://localhost:{Port}";

    public int Port { get; } = port;

    public async Task StartAsync()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.ConfigureKestrel(options =>
        {
            options.ListenLocalhost(Port);
        });

        _app = builder.Build();

        MapEndpoints(_app);
        MapEndpoints(_app.MapGroup("/common"));

        if (Directory.Exists(_webContentRoot))
        {
            var fileProvider = new PhysicalFileProvider(_webContentRoot);

            _app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = fileProvider,
                ServeUnknownFileTypes = true
            });

            _app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = fileProvider,
                RequestPath = "/common",
                ServeUnknownFileTypes = true
            });
        }

        await _app.StartAsync();
    }

    public async Task StopAsync()
    {
        if (_app is not null)
        {
            await _app.StopAsync();
            await _app.DisposeAsync();
            _app = null;
        }
    }

    public async ValueTask DisposeAsync()
    {
        await StopAsync();
    }

    private void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/basicAuth", BasicAuthHandler.Handle);
        endpoints.MapGet("/echo", (Delegate)EchoHandler.Handle);
        endpoints.MapGet("/cookie", CookieHandler.Handle);
        endpoints.MapGet("/encoding", EncodingHandler.Handle);
        endpoints.MapGet("/sleep", (Delegate)SleepHandler.Handle);
        endpoints.MapGet("/redirect", RedirectHandler.Handle);
        endpoints.MapGet("/page/{pageNumber}", PageHandler.Handle);
        endpoints.MapGet("/utf8/{*path}", (HttpContext context, string path) => Utf8Handler.Handle(context, path, _webContentRoot));
        endpoints.MapPost("/createPage", (Delegate)((HttpContext context) => CreatePageHandler.Handle(context, _pages, Port)));
        endpoints.MapPost("/upload", (Delegate)UploadHandler.Handle);

        endpoints.MapGet("/.well-known/web-identity", (HttpContext context) => FedCmHandler.HandleWebIdentity(context));
        endpoints.MapGet("/fedcm/config.json", (HttpContext context) => FedCmHandler.HandleConfig(context));
        endpoints.MapPost("/fedcm/id_assertion.json", (HttpContext context) => FedCmHandler.HandleIdAssertion(context));

        endpoints.MapGet("/temp/{fileName}", (string fileName) => CreatePageHandler.ServePage(fileName, _pages));
    }

    private static string FindWebContentRoot()
    {
        var info = new DirectoryInfo(AppContext.BaseDirectory);
        while (info is not null && info != info.Root)
        {
            string webPath = Path.Combine(info.FullName, "common", "src", "web");
            if (Directory.Exists(webPath))
            {
                return webPath;
            }
            info = info.Parent;
        }

        return string.Empty;
    }
}
