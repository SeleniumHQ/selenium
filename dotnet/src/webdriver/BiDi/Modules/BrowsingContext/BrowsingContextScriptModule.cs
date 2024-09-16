using System.Threading.Tasks;
using OpenQA.Selenium.BiDi.Modules.Script;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

public class BrowsingContextScriptModule(BrowsingContext context, ScriptModule scriptModule)
{
    public async Task<PreloadScript> AddPreloadScriptAsync(string functionDeclaration, BrowsingContextAddPreloadScriptOptions? options = null)
    {
        AddPreloadScriptOptions addPreloadScriptOptions = new(options)
        {
            Contexts = [context]
        };

        return await scriptModule.AddPreloadScriptAsync(functionDeclaration, addPreloadScriptOptions).ConfigureAwait(false);
    }

    public async Task<IReadOnlyList<RealmInfo>> GetRealmsAsync(GetRealmsOptions? options = null)
    {
        options ??= new();

        options.Context = context;

        return await scriptModule.GetRealmsAsync(options).ConfigureAwait(false);
    }

    public Task<RemoteValue> EvaluateAsync(string expression, bool awaitPromise, EvaluateOptions? options = null, ContextTargetOptions? targetOptions = null)
    {
        var contextTarget = new ContextTarget(context);

        if (targetOptions is not null)
        {
            contextTarget.Sandbox = targetOptions.Sandbox;
        }

        return scriptModule.EvaluateAsync(expression, awaitPromise, contextTarget, options);
    }

    public async Task<TResult?> EvaluateAsync<TResult>(string expression, bool awaitPromise, EvaluateOptions? options = null)
    {
        var remoteValue = await EvaluateAsync(expression, awaitPromise, options).ConfigureAwait(false);

        return remoteValue.ConvertTo<TResult>();
    }

    public Task<RemoteValue> CallFunctionAsync(string functionDeclaration, bool awaitPromise, CallFunctionOptions? options = null, ContextTargetOptions? targetOptions = null)
    {
        var contextTarget = new ContextTarget(context);

        if (targetOptions is not null)
        {
            contextTarget.Sandbox = targetOptions.Sandbox;
        }

        return scriptModule.CallFunctionAsync(functionDeclaration, awaitPromise, contextTarget, options);
    }
}
