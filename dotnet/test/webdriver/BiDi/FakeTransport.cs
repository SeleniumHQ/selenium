// <copyright file="FakeTransport.cs" company="Selenium Committers">
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

using System.Buffers;
using System.Text;
using System.Text.Json;
using System.Threading.Channels;
using OpenQA.Selenium.BiDi;

namespace OpenQA.Selenium.Tests.BiDi;

/// <summary>
/// A controllable in-process <see cref="ITransport"/> for unit-testing BiDi
/// functionality without a real browser or network connection.
/// </summary>
/// <remarks>
/// <para>
/// Outgoing commands (BiDi → transport) are captured in <see cref="SentMessages"/>
/// and can be inspected after the fact.
/// </para>
/// <para>
/// Incoming messages (transport → BiDi) are delivered one at a time from an
/// internal queue.  Tests push pre-scripted JSON strings via <see cref="Enqueue"/>,
/// <see cref="EnqueueSuccess"/>, <see cref="EnqueueError"/>, or
/// <see cref="EnqueueEvent"/>.  If the queue is empty, <see cref="ReceiveAsync"/>
/// blocks until a message is enqueued or the cancellation token fires — which is
/// exactly what makes timeout and cancellation tests deterministic.
/// </para>
/// </remarks>
internal sealed class FakeTransport : ITransport
{
    private readonly Channel<string> _incoming = Channel.CreateUnbounded<string>(
        new UnboundedChannelOptions { SingleReader = true, SingleWriter = false });

    /// <summary>All JSON strings that BiDi has sent through this transport.</summary>
    public List<string> SentMessages { get; } = [];

    /// <summary>
    /// Waits asynchronously until at least <paramref name="count"/> commands
    /// have been sent, then returns a snapshot of <see cref="SentMessages"/>.
    /// </summary>
    public async Task<IReadOnlyList<string>> WaitForSentMessagesAsync(
        int count = 1,
        CancellationToken cancellationToken = default)
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(5));

        while (SentMessages.Count < count)
        {
            await Task.Delay(5, cts.Token).ConfigureAwait(false);
        }

        return [.. SentMessages];
    }

    /// <summary>Enqueues a raw JSON string to be returned by the next <see cref="ReceiveAsync"/> call.</summary>
    public void Enqueue(string json)
        => _incoming.Writer.TryWrite(json);

    /// <summary>
    /// Enqueues a BiDi <c>success</c> response for the command with the given <paramref name="id"/>.
    /// </summary>
    /// <param name="id">The command id taken from the outgoing message.</param>
    /// <param name="resultJson">The JSON object to embed in the <c>result</c> field.</param>
    public void EnqueueSuccess(long id, string resultJson = "{}")
        => Enqueue($$"""{"id":{{id}},"type":"success","result":{{resultJson}}}""");

    /// <summary>
    /// Enqueues a BiDi <c>error</c> response for the command with the given <paramref name="id"/>.
    /// </summary>
    public void EnqueueError(long id, string error = "unknown error", string message = "")
        => Enqueue($$"""{"id":{{id}},"type":"error","error":"{{error}}","message":"{{message}}"}""");

    /// <summary>Enqueues a BiDi event message.</summary>
    /// <param name="method">The fully-qualified event method name, e.g. <c>log.entryAdded</c>.</param>
    /// <param name="paramsJson">The JSON object to embed in the <c>params</c> field.</param>
    public void EnqueueEvent(string method, string paramsJson = "{}")
        => Enqueue($$"""{"type":"event","method":"{{method}}","params":{{paramsJson}}}""");

    /// <summary>
    /// Reads the command id from the last sent message.
    /// Useful for building a matching success / error response.
    /// </summary>
    public long LastSentCommandId()
    {
        var json = SentMessages[^1];
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.GetProperty("id").GetInt64();
    }

    public async Task ReceiveAsync(IBufferWriter<byte> writer, CancellationToken cancellationToken)
    {
        var json = await _incoming.Reader.ReadAsync(cancellationToken).ConfigureAwait(false);
        var bytes = Encoding.UTF8.GetBytes(json);
        writer.Write(bytes);
    }

    public Task SendAsync(ReadOnlyMemory<byte> data, CancellationToken cancellationToken)
    {
        SentMessages.Add(Encoding.UTF8.GetString(data.Span));
        return Task.CompletedTask;
    }

    public ValueTask DisposeAsync()
    {
        _incoming.Writer.TryComplete();
        return ValueTask.CompletedTask;
    }
}
