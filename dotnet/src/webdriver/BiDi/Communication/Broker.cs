using OpenQA.Selenium.BiDi.Communication.Json.Converters;
using OpenQA.Selenium.BiDi.Communication.Transport;
using OpenQA.Selenium.Internal.Logging;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Communication;

public class Broker : IAsyncDisposable
{
    private readonly ILogger _logger = Log.GetLogger<Broker>();

    private readonly BiDi _bidi;
    private readonly ITransport _transport;

    private readonly ConcurrentDictionary<int, TaskCompletionSource<object>> _pendingCommands = new();
    private readonly BlockingCollection<MessageEvent> _pendingEvents = [];

    private readonly ConcurrentDictionary<string, List<EventHandler>> _eventHandlers = new();

    private int _currentCommandId;

    private static readonly TaskFactory _myTaskFactory = new(CancellationToken.None, TaskCreationOptions.DenyChildAttach, TaskContinuationOptions.None, TaskScheduler.Default);

    private Task? _receivingMessageTask;
    private Task? _eventEmitterTask;
    private CancellationTokenSource? _receiveMessagesCancellationTokenSource;

    private readonly JsonSerializerOptions _jsonSerializerOptions;

    public Broker(BiDi bidi, ITransport transport)
    {
        _bidi = bidi;
        _transport = transport;

        _jsonSerializerOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            Converters =
            {
                new BrowsingContextConverter(_bidi),
                new BrowserUserContextConverter(bidi),
                new NavigationConverter(),
                new InterceptConverter(_bidi),
                new RequestConverter(_bidi),
                new ChannelConverter(_bidi),
                new HandleConverter(_bidi),
                new InternalIdConverter(_bidi),
                new PreloadScriptConverter(_bidi),
                new RealmConverter(_bidi),
                new RealmTypeConverter(),
                new DateTimeOffsetConverter(),
                new PrintPageRangeConverter(),
                new JsonStringEnumConverter(JsonNamingPolicy.CamelCase),
                
                // https://github.com/dotnet/runtime/issues/72604
                new Json.Converters.Polymorphic.MessageConverter(),
                new Json.Converters.Polymorphic.EvaluateResultConverter(),
                new Json.Converters.Polymorphic.RemoteValueConverter(),
                new Json.Converters.Polymorphic.RealmInfoConverter(),
                new Json.Converters.Polymorphic.LogEntryConverter(),
                //
            }
        };
    }

    public async Task ConnectAsync(CancellationToken cancellationToken)
    {
        await _transport.ConnectAsync(cancellationToken).ConfigureAwait(false);

        _receiveMessagesCancellationTokenSource = new CancellationTokenSource();
        _receivingMessageTask = _myTaskFactory.StartNew(async () => await ReceiveMessagesAsync(_receiveMessagesCancellationTokenSource.Token), TaskCreationOptions.LongRunning).Unwrap();
        _eventEmitterTask = _myTaskFactory.StartNew(async () => await ProcessEventsAwaiterAsync(), TaskCreationOptions.LongRunning).Unwrap();
    }

    private async Task ReceiveMessagesAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            var message = await _transport.ReceiveAsJsonAsync<Message>(_jsonSerializerOptions, cancellationToken);

            switch (message)
            {
                case MessageSuccess messageSuccess:
                    _pendingCommands[messageSuccess.Id].SetResult(messageSuccess.Result);
                    _pendingCommands.TryRemove(messageSuccess.Id, out _);
                    break;
                case MessageEvent messageEvent:
                    _pendingEvents.Add(messageEvent);
                    break;
                case MessageError mesageError:
                    _pendingCommands[mesageError.Id].SetException(new BiDiException($"{mesageError.Error}: {mesageError.Message}"));
                    _pendingCommands.TryRemove(mesageError.Id, out _);
                    break;
            }
        }
    }

    private async Task ProcessEventsAwaiterAsync()
    {
        foreach (var result in _pendingEvents.GetConsumingEnumerable())
        {
            try
            {
                if (_eventHandlers.TryGetValue(result.Method, out var eventHandlers))
                {
                    if (eventHandlers is not null)
                    {
                        foreach (var handler in eventHandlers.ToArray()) // copy handlers avoiding modified collection while iterating
                        {
                            var args = (EventArgs)result.Params.Deserialize(handler.EventArgsType, _jsonSerializerOptions)!;

                            args.BiDi = _bidi;

                            // handle browsing context subscriber
                            if (handler.Contexts is not null && args is BrowsingContextEventArgs browsingContextEventArgs && handler.Contexts.Contains(browsingContextEventArgs.Context))
                            {
                                await handler.InvokeAsync(args).ConfigureAwait(false);
                            }
                            // handle only session subscriber
                            else if (handler.Contexts is null)
                            {
                                await handler.InvokeAsync(args).ConfigureAwait(false);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                if (_logger.IsEnabled(LogEventLevel.Error))
                {
                    _logger.Error($"Unhandled error processing BiDi event: {ex}");
                }
            }
        }
    }

    public async Task<TResult> ExecuteCommandAsync<TResult>(Command command, CommandOptions? options)
    {
        var result = await ExecuteCommandCoreAsync(command, options).ConfigureAwait(false);

        return (TResult)((JsonElement)result).Deserialize(typeof(TResult), _jsonSerializerOptions)!;
    }

    public async Task ExecuteCommandAsync(Command command, CommandOptions? options)
    {
        await ExecuteCommandCoreAsync(command, options).ConfigureAwait(false);
    }

    private async Task<object> ExecuteCommandCoreAsync(Command command, CommandOptions? options)
    {
        command.Id = Interlocked.Increment(ref _currentCommandId);

        var tcs = new TaskCompletionSource<object>(TaskCreationOptions.RunContinuationsAsynchronously);

        var timeout = options?.Timeout ?? TimeSpan.FromSeconds(30);

        using var cts = new CancellationTokenSource(timeout);

        cts.Token.Register(() => tcs.TrySetCanceled(cts.Token));

        _pendingCommands[command.Id] = tcs;

        await _transport.SendAsJsonAsync(command, _jsonSerializerOptions, cts.Token).ConfigureAwait(false);

        return await tcs.Task.ConfigureAwait(false);
    }

    public async Task<Subscription> SubscribeAsync<TEventArgs>(string eventName, Action<TEventArgs> action, SubscriptionOptions? options = null)
        where TEventArgs : EventArgs
    {
        var handlers = _eventHandlers.GetOrAdd(eventName, (a) => []);

        if (options is BrowsingContextsSubscriptionOptions browsingContextsOptions)
        {
            await _bidi.SessionModule.SubscribeAsync([eventName], new() { Contexts = browsingContextsOptions.Contexts }).ConfigureAwait(false);

            var eventHandler = new SyncEventHandler<TEventArgs>(eventName, action, browsingContextsOptions?.Contexts);

            handlers.Add(eventHandler);

            return new Subscription(this, eventHandler);
        }
        else
        {
            await _bidi.SessionModule.SubscribeAsync([eventName]).ConfigureAwait(false);

            var eventHandler = new SyncEventHandler<TEventArgs>(eventName, action);

            handlers.Add(eventHandler);

            return new Subscription(this, eventHandler);
        }
    }

    public async Task<Subscription> SubscribeAsync<TEventArgs>(string eventName, Func<TEventArgs, Task> func, SubscriptionOptions? options = null)
        where TEventArgs : EventArgs
    {
        var handlers = _eventHandlers.GetOrAdd(eventName, (a) => []);

        if (options is BrowsingContextsSubscriptionOptions browsingContextsOptions)
        {
            await _bidi.SessionModule.SubscribeAsync([eventName], new() { Contexts = browsingContextsOptions.Contexts }).ConfigureAwait(false);

            var eventHandler = new AsyncEventHandler<TEventArgs>(eventName, func, browsingContextsOptions.Contexts);

            handlers.Add(eventHandler);

            return new Subscription(this, eventHandler);
        }
        else
        {
            await _bidi.SessionModule.SubscribeAsync([eventName]).ConfigureAwait(false);

            var eventHandler = new AsyncEventHandler<TEventArgs>(eventName, func);

            handlers.Add(eventHandler);

            return new Subscription(this, eventHandler);
        }
    }

    public async Task UnsubscribeAsync(EventHandler eventHandler)
    {
        var eventHandlers = _eventHandlers[eventHandler.EventName];

        eventHandlers.Remove(eventHandler);

        if (eventHandler.Contexts is not null)
        {
            if (!eventHandlers.Any(h => eventHandler.Contexts.Equals(h.Contexts)) && !eventHandlers.Any(h => h.Contexts is null))
            {
                await _bidi.SessionModule.UnsubscribeAsync([eventHandler.EventName], new() { Contexts = eventHandler.Contexts }).ConfigureAwait(false);
            }
        }
        else
        {
            if (!eventHandlers.Any(h => h.Contexts is not null) && !eventHandlers.Any(h => h.Contexts is null))
            {
                await _bidi.SessionModule.UnsubscribeAsync([eventHandler.EventName]).ConfigureAwait(false);
            }
        }
    }

    public async ValueTask DisposeAsync()
    {
        _pendingEvents.CompleteAdding();

        _receiveMessagesCancellationTokenSource?.Cancel();

        if (_eventEmitterTask is not null)
        {
            await _eventEmitterTask.ConfigureAwait(false);
        }
    }
}
