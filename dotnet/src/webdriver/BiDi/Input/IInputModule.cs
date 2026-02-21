namespace OpenQA.Selenium.BiDi.Input;

public interface IInputModule
{
    Task<Subscription> OnFileDialogOpenedAsync(Func<FileDialogEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnFileDialogOpenedAsync(Action<FileDialogEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<PerformActionsResult> PerformActionsAsync(BrowsingContext.BrowsingContext context, IEnumerable<SourceActions> actions, PerformActionsOptions? options = null, CancellationToken cancellationToken = default);
    Task<ReleaseActionsResult> ReleaseActionsAsync(BrowsingContext.BrowsingContext context, ReleaseActionsOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetFilesResult> SetFilesAsync(BrowsingContext.BrowsingContext context, Script.ISharedReference element, IEnumerable<string> files, SetFilesOptions? options = null, CancellationToken cancellationToken = default);
}
