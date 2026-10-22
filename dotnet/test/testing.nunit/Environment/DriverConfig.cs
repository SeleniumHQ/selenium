// <copyright file="DriverConfig.cs" company="Selenium Committers">
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

using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.Testing.NUnit.Environment;

public class DriverConfig
{
    [JsonPropertyName("Browser")]
    [JsonConverter(typeof(JsonStringEnumConverter<Browser>))]
    public Browser BrowserValue { get; set; }

    public JsonElement Options { get; set; }

    public string RemoteCapabilities { get; set; }

    public bool AutoStartRemoteServer { get; set; }

    public bool Logging { get; set; }

    public void ValidateOptions()
    {
        switch (this.BrowserValue)
        {
            case Browser.Chrome:
                this.GetBrowserOptions<ChromeDriverConfigOptions>("Chrome");
                break;
            case Browser.Edge:
                this.GetBrowserOptions<ChromiumDriverConfigOptions>("Edge");
                break;
            case Browser.IE:
                this.GetBrowserOptions<InternetExplorerDriverConfigOptions>("InternetExplorer");
                break;
            case Browser.Firefox:
                this.GetBrowserOptions<FirefoxDriverConfigOptions>("Firefox");
                break;
            case Browser.Safari:
                this.GetBrowserOptions<SafariDriverConfigOptions>("Safari");
                break;
            case Browser.Remote:
                this.GetBrowserOptions<RemoteDriverConfigOptions>("Remote");
                break;
            default:
                throw new JsonException($"Unsupported browser value '{this.BrowserValue}' in driver config.");
        }
    }

    public T GetBrowserOptions<T>(string browserOptionsName) where T : class, new()
    {
        if (this.Options.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
        {
            return new T();
        }

        if (this.Options.ValueKind != JsonValueKind.Object)
        {
            throw new JsonException("Driver config Options must be an object.");
        }

        JsonProperty? matchingOptions = null;
        foreach (JsonProperty property in this.Options.EnumerateObject())
        {
            if (matchingOptions.HasValue || property.Name != browserOptionsName)
            {
                throw new JsonException($"Options for browser '{this.BrowserValue}' must contain only a '{browserOptionsName}' object.");
            }

            matchingOptions = property;
        }

        if (!matchingOptions.HasValue)
        {
            return new T();
        }

        return matchingOptions.Value.Value.Deserialize<T>(DriverConfigJson.Options) ?? new T();
    }
}

public sealed class ChromeDriverConfigOptions
{
    public string BrowserVersion { get; set; }
}

public sealed class ChromiumDriverConfigOptions
{
    public string BrowserVersion { get; set; }
}

public sealed class InternetExplorerDriverConfigOptions
{
    public bool RequireWindowFocus { get; set; }

    public bool UsePerProcessProxy { get; set; }

    public bool AttachToEdgeChrome { get; set; }
}

public sealed class FirefoxDriverConfigOptions
{
    public string BrowserVersion { get; set; }

    public bool AcceptInsecureCertificates { get; set; }

    public bool EnableDevToolsProtocol { get; set; }
}

public sealed class SafariDriverConfigOptions
{
    public bool UseTechnologyPreview { get; set; }
}

public sealed class RemoteDriverConfigOptions
{
}

internal static class DriverConfigJson
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true,
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow,
    };
}
