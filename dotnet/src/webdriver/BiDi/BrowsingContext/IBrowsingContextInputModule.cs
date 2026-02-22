using OpenQA.Selenium.BiDi.Input;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public interface IBrowsingContextInputModule
{
    Task<Subscription> OnFileDialogOpenedAsync(Func<FileDialogEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnFileDialogOpenedAsync(Action<FileDialogEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<PerformActionsResult> PerformActionsAsync(IEnumerable<SourceActions> actions, PerformActionsOptions? options = null, CancellationToken cancellationToken = default);
    Task<ReleaseActionsResult> ReleaseActionsAsync(ReleaseActionsOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetFilesResult> SetFilesAsync(Script.ISharedReference element, IEnumerable<string> files, SetFilesOptions? options = null, CancellationToken cancellationToken = default);
}
