using OpenQA.Selenium.BiDi.Communication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Script;

public sealed class ScriptModule(Broker broker) : Module(broker)
{
    public async Task<EvaluateResult.Success> EvaluateAsync(string expression, bool awaitPromise, Target target, EvaluateOptions? options = null)
    {
        var @params = new EvaluateCommandParameters(expression, target, awaitPromise);

        if (options is not null)
        {
            @params.ResultOwnership = options.ResultOwnership;
            @params.SerializationOptions = options.SerializationOptions;
            @params.UserActivation = options.UserActivation;
        }

        var result = await Broker.ExecuteCommandAsync<EvaluateResult>(new EvaluateCommand(@params), options).ConfigureAwait(false);

        if (result is EvaluateResult.Exception exp)
        {
            throw new ScriptEvaluateException(exp);
        }

        return (EvaluateResult.Success)result;
    }

    public async Task<TResult?> EvaluateAsync<TResult>(string expression, bool awaitPromise, Target target, EvaluateOptions? options = null)
    {
        var result = await EvaluateAsync(expression, awaitPromise, target, options).ConfigureAwait(false);

        return result.Result.ConvertTo<TResult>();
    }

    public async Task<EvaluateResult.Success> CallFunctionAsync(string functionDeclaration, bool awaitPromise, Target target, CallFunctionOptions? options = null)
    {
        var @params = new CallFunctionCommandParameters(functionDeclaration, awaitPromise, target);

        if (options is not null)
        {
            @params.Arguments = options.Arguments?.Select(LocalValue.ConvertFrom);
            @params.ResultOwnership = options.ResultOwnership;
            @params.SerializationOptions = options.SerializationOptions;
            @params.This = LocalValue.ConvertFrom(options.This);
            @params.UserActivation = options.UserActivation;
        }

        var result = await Broker.ExecuteCommandAsync<EvaluateResult>(new CallFunctionCommand(@params), options).ConfigureAwait(false);

        if (result is EvaluateResult.Exception exp)
        {
            throw new ScriptEvaluateException(exp);
        }

        return (EvaluateResult.Success)result;
    }

    public async Task<TResult?> CallFunctionAsync<TResult>(string functionDeclaration, bool awaitPromise, Target target, CallFunctionOptions? options = null)
    {
        var result = await CallFunctionAsync(functionDeclaration, awaitPromise, target, options).ConfigureAwait(false);

        return result.Result.ConvertTo<TResult>();
    }

    public async Task<GetRealmsResult> GetRealmsAsync(GetRealmsOptions? options = null)
    {
        var @params = new GetRealmsCommandParameters();

        if (options is not null)
        {
            @params.Context = options.Context;
            @params.Type = options.Type;
        }

        return await Broker.ExecuteCommandAsync<GetRealmsResult>(new GetRealmsCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<PreloadScript> AddPreloadScriptAsync(string functionDeclaration, AddPreloadScriptOptions? options = null)
    {
        var @params = new AddPreloadScriptCommandParameters(functionDeclaration);

        if (options is not null)
        {
            @params.Contexts = options.Contexts;
            @params.Arguments = options.Arguments;
            @params.Sandbox = options.Sandbox;
        }

        var result = await Broker.ExecuteCommandAsync<AddPreloadScriptResult>(new AddPreloadScriptCommand(@params), options).ConfigureAwait(false);

        return result.Script;
    }

    public async Task RemovePreloadScriptAsync(PreloadScript script, RemovePreloadScriptOptions? options = null)
    {
        var @params = new RemovePreloadScriptCommandParameters(script);

        await Broker.ExecuteCommandAsync(new RemovePreloadScriptCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnMessageAsync(Func<MessageEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.message", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnMessageAsync(Action<MessageEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.message", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmCreatedAsync(Func<RealmInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.realmCreated", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmCreatedAsync(Action<RealmInfo> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.realmCreated", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmDestroyedAsync(Func<RealmDestroyedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.realmDestroyed", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmDestroyedAsync(Action<RealmDestroyedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.realmDestroyed", handler, options).ConfigureAwait(false);
    }
}
