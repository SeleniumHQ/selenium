using System;
using System.IO;
using System.Net.WebSockets;
using System.Threading.Tasks;
using System.Threading;
using System.Text.Json;
using System.Text;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.BiDi.Communication.Transport;

public class WebSocketTransport(Uri _uri) : ITransport, IDisposable
{
    private readonly static ILogger _logger = Log.GetLogger<WebSocketTransport>();

    private readonly ClientWebSocket _webSocket = new();
    private readonly ArraySegment<byte> _receiveBuffer = new(new byte[1024 * 8]);

    public async Task ConnectAsync(CancellationToken cancellationToken)
    {
        _webSocket.Options.SetBuffer(_receiveBuffer.Count, _receiveBuffer.Count, _receiveBuffer);
        await _webSocket.ConnectAsync(_uri, cancellationToken).ConfigureAwait(false);
    }

    public async Task<T> ReceiveAsJsonAsync<T>(JsonSerializerOptions jsonSerializerOptions, CancellationToken cancellationToken)
    {
        using var ms = new MemoryStream();

        WebSocketReceiveResult result;

        do
        {
            result = await _webSocket.ReceiveAsync(_receiveBuffer, cancellationToken).ConfigureAwait(false);

            await ms.WriteAsync(_receiveBuffer.Array!, _receiveBuffer.Offset, result.Count).ConfigureAwait(false);
        } while (!result.EndOfMessage);

        ms.Seek(0, SeekOrigin.Begin);

        if (_logger.IsEnabled(LogEventLevel.Trace))
        {
            _logger.Trace($"BiDi RCV << {Encoding.UTF8.GetString(ms.ToArray())}");
        }

        var res = await JsonSerializer.DeserializeAsync(ms, typeof(T), jsonSerializerOptions, cancellationToken).ConfigureAwait(false);

        return (T)res!;
    }

    public async Task SendAsJsonAsync(Command command, JsonSerializerOptions jsonSerializerOptions, CancellationToken cancellationToken)
    {
        var buffer = JsonSerializer.SerializeToUtf8Bytes(command, typeof(Command), jsonSerializerOptions);

        if (_logger.IsEnabled(LogEventLevel.Trace))
        {
            _logger.Trace($"BiDi SND >> {buffer.Length} > {Encoding.UTF8.GetString(buffer)}");
        }

        await _webSocket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, cancellationToken).ConfigureAwait(false);
    }

    public void Dispose()
    {
        _webSocket.Dispose();
    }
}
