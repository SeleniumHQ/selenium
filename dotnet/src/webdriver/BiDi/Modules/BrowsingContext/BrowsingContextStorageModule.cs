using System.Threading.Tasks;
using OpenQA.Selenium.BiDi.Modules.Storage;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

public class BrowsingContextStorageModule(BrowsingContext context, StorageModule storageModule)
{
    public Task<GetCookiesResult> GetCookiesAsync(GetCookiesOptions? options = null)
    {
        options ??= new();

        options.Partition = new BrowsingContextPartitionDescriptor(context);

        return storageModule.GetCookiesAsync(options);
    }

    public async Task<PartitionKey> DeleteCookiesAsync(DeleteCookiesOptions? options = null)
    {
        options ??= new();

        options.Partition = new BrowsingContextPartitionDescriptor(context);

        var res = await storageModule.DeleteCookiesAsync(options).ConfigureAwait(false);

        return res.PartitionKey;
    }

    public async Task<PartitionKey> SetCookieAsync(PartialCookie cookie, SetCookieOptions? options = null)
    {
        options ??= new();

        options.Partition = new BrowsingContextPartitionDescriptor(context);

        var res = await storageModule.SetCookieAsync(cookie, options).ConfigureAwait(false);

        return res.PartitionKey;
    }
}
