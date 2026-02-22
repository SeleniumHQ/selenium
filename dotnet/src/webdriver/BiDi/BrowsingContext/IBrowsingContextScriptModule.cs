using System.Diagnostics.CodeAnalysis;
using OpenQA.Selenium.BiDi.Script;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public interface IBrowsingContextScriptModule
{
    Task<AddPreloadScriptResult> AddPreloadScriptAsync([StringSyntax("javascript")] string functionDeclaration, ContextAddPreloadScriptOptions? options = null, CancellationToken cancellationToken = default);
    Task<EvaluateResult> CallFunctionAsync([StringSyntax("javascript")] string functionDeclaration, bool awaitPromise, CallFunctionOptions? options = null, ContextTargetOptions? targetOptions = null, CancellationToken cancellationToken = default);
    Task<TResult?> CallFunctionAsync<TResult>([StringSyntax("javascript")] string functionDeclaration, bool awaitPromise, CallFunctionOptions? options = null, ContextTargetOptions? targetOptions = null, CancellationToken cancellationToken = default);
    Task<EvaluateResult> EvaluateAsync([StringSyntax("javascript")] string expression, bool awaitPromise, EvaluateOptions? options = null, ContextTargetOptions? targetOptions = null, CancellationToken cancellationToken = default);
    Task<TResult?> EvaluateAsync<TResult>([StringSyntax("javascript")] string expression, bool awaitPromise, EvaluateOptions? options = null, ContextTargetOptions? targetOptions = null, CancellationToken cancellationToken = default);
    Task<GetRealmsResult> GetRealmsAsync(ContextGetRealmsOptions? options = null, CancellationToken cancellationToken = default);
}
