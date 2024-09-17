using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Communication;

public abstract class EventHandler(string eventName, Type eventArgsType, IEnumerable<BrowsingContext>? contexts = null)
{
    public string EventName { get; } = eventName;
    public Type EventArgsType { get; set; } = eventArgsType;
    public IEnumerable<BrowsingContext>? Contexts { get; } = contexts;

    public abstract ValueTask InvokeAsync(object args);
}

internal class AsyncEventHandler<TEventArgs>(string eventName, Func<TEventArgs, Task> func, IEnumerable<BrowsingContext>? contexts = null)
    : EventHandler(eventName, typeof(TEventArgs), contexts) where TEventArgs : EventArgs
{
    private readonly Func<TEventArgs, Task> _func = func;

    public override async ValueTask InvokeAsync(object args)
    {
        await _func((TEventArgs)args).ConfigureAwait(false);
    }
}

internal class SyncEventHandler<TEventArgs>(string eventName, Action<TEventArgs> action, IEnumerable<BrowsingContext>? contexts = null)
    : EventHandler(eventName, typeof(TEventArgs), contexts) where TEventArgs : EventArgs
{
    private readonly Action<TEventArgs> _action = action;

    public override ValueTask InvokeAsync(object args)
    {
        _action((TEventArgs)args);

        return default;
    }
}
