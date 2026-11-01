// <copyright file="DevToolsSerializationTests.cs" company="Selenium Committers">
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

using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;
using Moq;
using OpenQA.Selenium.DevTools;
using Network = OpenQA.Selenium.DevTools.V155.Network;
using Runtime = OpenQA.Selenium.DevTools.V155.Runtime;

namespace OpenQA.Selenium.Tests.DevTools;

[TestFixture]
public class DevToolsSerializationTests
{
    [TestCase(154)]
    [TestCase(155)]
    [TestCase(156)]
    public void GeneratedMetadataCoversCommandsResponsesAndEvents(int version)
    {
        JsonSerializerContext context = GetContext(version);
        string prefix = $"OpenQA.Selenium.DevTools.V{version}.";
        Type[] types = typeof(ICommand).Assembly.GetTypes()
            .Where(type => type.Namespace?.StartsWith(prefix, StringComparison.Ordinal) == true
                && (typeof(ICommand).IsAssignableFrom(type)
                    || typeof(ICommandResponse).IsAssignableFrom(type)
                    || typeof(EventArgs).IsAssignableFrom(type)))
            .ToArray();

        Assert.That(types.Any(type => typeof(ICommand).IsAssignableFrom(type)), Is.True);
        Assert.That(types.Any(type => typeof(ICommandResponse).IsAssignableFrom(type)), Is.True);
        Assert.That(types.Any(type => typeof(EventArgs).IsAssignableFrom(type)), Is.True);
        Assert.That(context.Options.TypeInfoResolver, Is.SameAs(context));
        Assert.That(context.GetTypeInfo(typeof(DevToolsSerializationTests)), Is.Null,
            "The generated context must not fall back to reflection for unregistered types.");

        foreach (Type type in types)
        {
            JsonTypeInfo metadata = context.GetTypeInfo(type);
            Assert.That(metadata, Is.Not.Null, $"Missing generated metadata for {type.FullName}");
            Assert.That(metadata.Type, Is.EqualTo(type));
            Assert.That(metadata.Options, Is.SameAs(context.Options));
        }
    }

    [Test]
    public void GeneratedDomainsRegisterCommandAndResponseMetadata()
    {
        var domains = new OpenQA.Selenium.DevTools.V155.DevToolsSessionDomains(new Mock<IDevToolsSession>().Object);
        var map = (CommandResponseTypeMap)typeof(DevToolsSessionDomains)
            .GetProperty("ResponseTypeMap", BindingFlags.Instance | BindingFlags.NonPublic).GetValue(domains);
        object[] arguments = { typeof(Runtime.EvaluateCommandSettings), null, null };

        var found = (bool)typeof(CommandResponseTypeMap)
            .GetMethod("TryGetCommandResponseTypeInfo", BindingFlags.Instance | BindingFlags.NonPublic)
            .Invoke(map, arguments);

        Assert.That(found, Is.True);
        var commandMetadata = (JsonTypeInfo)arguments[1];
        var responseMetadata = (JsonTypeInfo)arguments[2];
        Assert.That(commandMetadata.Type, Is.EqualTo(typeof(Runtime.EvaluateCommandSettings)));
        Assert.That(responseMetadata.Type, Is.EqualTo(typeof(Runtime.EvaluateCommandResponse)));
        Assert.That(commandMetadata.Options, Is.SameAs(GetContext(155).Options));
        Assert.That(responseMetadata.Options, Is.SameAs(GetContext(155).Options));
        Assert.That(map.TryGetCommandResponseType<Runtime.EvaluateCommandSettings>(out Type responseType), Is.True);
        Assert.That(responseType, Is.EqualTo(typeof(Runtime.EvaluateCommandResponse)));
        Assert.That(JsonSerializer.Serialize(new Runtime.EvaluateCommandSettings { Expression = "answer" }, commandMetadata),
            Is.EqualTo("""{"expression":"answer"}"""));
        var response = (Runtime.EvaluateCommandResponse)JsonSerializer.Deserialize(
            """{"result":{"type":"number","value":3}}""", responseMetadata);
        Assert.That(response.Result.Type, Is.EqualTo(Runtime.RemoteObjectTypeValues.Number));
        Assert.That(((JsonElement)response.Result.Value).GetInt32(), Is.EqualTo(3));
    }

    [Test]
    public void CommandOmitsUnsetOptionalProperties()
    {
        var command = new Runtime.EvaluateCommandSettings { Expression = "answer" };

        string json = JsonSerializer.Serialize(command, GetMetadata(command.GetType()));

        Assert.That(json, Is.EqualTo("""{"expression":"answer"}"""));
    }

    [Test]
    public void CommandPreservesExplicitDefaultOptionalValues()
    {
        var command = new Runtime.EvaluateCommandSettings
        {
            Expression = "0",
            ObjectGroup = "",
            Silent = false,
            Timeout = 0,
        };

        using JsonDocument document = JsonDocument.Parse(JsonSerializer.Serialize(command, GetMetadata(command.GetType())));
        JsonElement root = document.RootElement;

        Assert.That(root.EnumerateObject().Select(property => property.Name),
            Is.EquivalentTo(new[] { "expression", "objectGroup", "silent", "timeout" }));
        Assert.That(root.GetProperty("expression").GetString(), Is.EqualTo("0"));
        Assert.That(root.GetProperty("objectGroup").GetString(), Is.EqualTo(""));
        Assert.That(root.GetProperty("silent").GetBoolean(), Is.False);
        Assert.That(root.GetProperty("timeout").GetDouble(), Is.Zero);
    }

    [TestCase(Runtime.SerializationOptionsSerializationValues.Deep, "deep")]
    [TestCase(Runtime.SerializationOptionsSerializationValues.IdOnly, "idOnly")]
    public void CommandSerializesNestedEnumUsingProtocolName(Runtime.SerializationOptionsSerializationValues mode, string wireName)
    {
        var command = new Runtime.EvaluateCommandSettings
        {
            Expression = "object",
            SerializationOptions = new Runtime.SerializationOptions { Serialization = mode, MaxDepth = 0 },
        };

        using JsonDocument document = JsonDocument.Parse(JsonSerializer.Serialize(command, GetMetadata(command.GetType())));
        JsonElement options = document.RootElement.GetProperty("serializationOptions");

        Assert.That(options.EnumerateObject().Select(property => property.Name), Is.EquivalentTo(new[] { "serialization", "maxDepth" }));
        Assert.That(options.GetProperty("serialization").GetString(), Is.EqualTo(wireName));
        Assert.That(options.GetProperty("maxDepth").GetInt64(), Is.Zero);
    }

    [TestCase("string", Runtime.RemoteObjectTypeValues.String)]
    [TestCase("String", Runtime.RemoteObjectTypeValues.String)]
    [TestCase("bigint", Runtime.RemoteObjectTypeValues.Bigint)]
    public void ResponseDeserializesEnumAndOptionalFields(string wireType, Runtime.RemoteObjectTypeValues expectedType)
    {
        string json = $$$"""{"result":{"type":"{{{wireType}}}","description":"answer","value":"42"}}""";

        var response = (Runtime.EvaluateCommandResponse)JsonSerializer.Deserialize(json, GetMetadata(typeof(Runtime.EvaluateCommandResponse)));

        Assert.That(response.Result.Type, Is.EqualTo(expectedType));
        Assert.That(response.Result.Description, Is.EqualTo("answer"));
        Assert.That(((JsonElement)response.Result.Value).GetString(), Is.EqualTo("42"));
        Assert.That(response.ExceptionDetails, Is.Null);
    }

    [Test]
    public void ResponsePreservesUnknownEnumDefault()
    {
        const string json = """{"result":{"type":"not-a-cdp-type","description":"unknown"}}""";

        var response = (Runtime.EvaluateCommandResponse)JsonSerializer.Deserialize(json, GetMetadata(typeof(Runtime.EvaluateCommandResponse)));

        Assert.That(response.Result.Type, Is.EqualTo(Runtime.RemoteObjectTypeValues.Object));
        Assert.That(response.Result.Description, Is.EqualTo("unknown"));
    }

    [Test]
    public void ResponseRejectsNullEnumValue()
    {
        const string json = """{"result":{"type":null}}""";

        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize(json, GetMetadata(typeof(Runtime.EvaluateCommandResponse))));
    }

    [Test]
    public void ResponsePreservesPresentOptionalExceptionDetails()
    {
        const string json = """
            {"result":{"type":"undefined"},
             "exceptionDetails":{"exceptionId":7,"text":"failed","lineNumber":3,"columnNumber":4}}
            """;

        var response = (Runtime.EvaluateCommandResponse)JsonSerializer.Deserialize(json, GetMetadata(typeof(Runtime.EvaluateCommandResponse)));

        Assert.That(response.Result.Type, Is.EqualTo(Runtime.RemoteObjectTypeValues.Undefined));
        Assert.That(response.ExceptionDetails.ExceptionId, Is.EqualTo(7));
        Assert.That(response.ExceptionDetails.Text, Is.EqualTo("failed"));
        Assert.That(response.ExceptionDetails.LineNumber, Is.EqualTo(3));
        Assert.That(response.ExceptionDetails.ColumnNumber, Is.EqualTo(4));
        Assert.That(response.Result.Description, Is.Null);
        Assert.That(response.Result.Value, Is.Null);
    }

    [TestCase("123.50", "123.50", TestName = "GeneratedEventAdapterConvertsCdpStringTokens_Number")]
    [TestCase("-0.25e+2", "-0.25e+2", TestName = "GeneratedEventAdapterConvertsCdpStringTokens_Exponent")]
    [TestCase("true", "true", TestName = "GeneratedEventAdapterConvertsCdpStringTokens_True")]
    [TestCase("false", "false", TestName = "GeneratedEventAdapterConvertsCdpStringTokens_False")]
    [TestCase("\"line\\n\\u2603\"", "line\n\u2603", TestName = "GeneratedEventAdapterConvertsCdpStringTokens_EscapedUnicode")]
    [TestCase("null", null, TestName = "GeneratedEventAdapterConvertsCdpStringTokens_Null")]
    public void GeneratedEventAdapterConvertsCdpStringTokens(string token, string expected)
    {
        var session = new Mock<IDevToolsSession>();
        var adapter = new Network.NetworkAdapter(session.Object);
        Network.RequestWillBeSentEventArgs received = null;
        adapter.RequestWillBeSent += (_, args) => received = args;
        using JsonDocument document = JsonDocument.Parse(RequestEventJson(token));

        session.Raise(mock => mock.DevToolsEventReceived += null,
            new DevToolsEventReceivedEventArgs("Network", "requestWillBeSent", document.RootElement));

        Assert.That(received, Is.Not.Null);
        Assert.That(received.RequestId, Is.EqualTo("request-17"));
        Assert.That(received.Request.PostData, Is.EqualTo(expected));
        Assert.That(received.Request.Method, Is.EqualTo("POST"));
        Assert.That(received.Timestamp, Is.EqualTo(12.5));
        Assert.That(received.Type, Is.EqualTo(Network.ResourceType.Fetch));
        Assert.That(received.RedirectResponse, Is.Null);
        Assert.That(received.HasUserGesture, Is.False);
    }

    [Test]
    public void GeneratedEventMetadataPreservesHeaderKeysAndStringTokens()
    {
        string json = RequestEventJson("null", """{"X-Test Header":42,"boolean":false,"nothing":null,"escaped\"key":"line\nvalue"}""");

        var received = (Network.RequestWillBeSentEventArgs)JsonSerializer.Deserialize(json, GetMetadata(typeof(Network.RequestWillBeSentEventArgs)));

        Assert.That(received.Request.Headers.Keys, Is.EquivalentTo(new[] { "X-Test Header", "boolean", "nothing", "escaped\"key" }));
        Assert.That(received.Request.Headers["X-Test Header"], Is.EqualTo("42"));
        Assert.That(received.Request.Headers["boolean"], Is.EqualTo("false"));
        Assert.That(received.Request.Headers["nothing"], Is.Null);
        Assert.That(received.Request.Headers["escaped\"key"], Is.EqualTo("line\nvalue"));

        using JsonDocument serialized = JsonDocument.Parse(JsonSerializer.Serialize(received, GetMetadata(received.GetType())));
        JsonElement headers = serialized.RootElement.GetProperty("request").GetProperty("headers");
        Assert.That(headers.GetProperty("X-Test Header").ValueKind, Is.EqualTo(JsonValueKind.String));
        Assert.That(headers.GetProperty("X-Test Header").GetString(), Is.EqualTo("42"));
        Assert.That(headers.GetProperty("boolean").GetString(), Is.EqualTo("false"));
        Assert.That(headers.GetProperty("nothing").ValueKind, Is.EqualTo(JsonValueKind.Null));
        Assert.That(headers.GetProperty("escaped\"key").GetString(), Is.EqualTo("line\nvalue"));
        Assert.That(serialized.RootElement.GetProperty("type").GetString(), Is.EqualTo("Fetch"));
        Assert.That(serialized.RootElement.TryGetProperty("redirectResponse", out _), Is.False);
        Assert.That(serialized.RootElement.GetProperty("redirectHasExtraInfo").GetBoolean(), Is.False);
    }

    private static string RequestEventJson(string postData, string headers = "{}") => $$"""
        {
          "requestId":"request-17","loaderId":"loader-3","documentURL":"about:blank",
          "request":{"url":"about:blank","method":"POST","headers":{{headers}},"postData":{{postData}},
                     "initialPriority":"High","referrerPolicy":"no-referrer"},
          "timestamp":12.5,"wallTime":24,"initiator":{"type":"other"},
          "redirectHasExtraInfo":false,"type":"Fetch","hasUserGesture":false
        }
        """;

    private static JsonTypeInfo GetMetadata(Type type) => GetContext(155).GetTypeInfo(type);

    private static JsonSerializerContext GetContext(int version)
    {
        // Reflection only obtains the internal context. Every serialization operation uses
        // its source-generated metadata explicitly, never a reflection-based resolver.
        Type contextType = typeof(ICommand).Assembly.GetTypes().Single(type =>
            type.Namespace == $"OpenQA.Selenium.DevTools.V{version}"
            && typeof(JsonSerializerContext).IsAssignableFrom(type));
        return (JsonSerializerContext)contextType.GetProperty("Default", BindingFlags.Public | BindingFlags.Static).GetValue(null);
    }
}
