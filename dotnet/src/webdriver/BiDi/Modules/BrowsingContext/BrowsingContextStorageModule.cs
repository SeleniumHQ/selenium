using System.Threading.Tasks;
using OpenQA.Selenium.BiDi.Modules.Storage;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

public class BrowsingContextStorageModule(BrowsingContext context, StorageModule storageModule)
{
    public Task<GetCookiesResult> GetCookiesAsync(GetCookiesOptions? options = null)
    {
        options ??= new();

        options.Partition = new PartitionDescriptor.Context(context);

        return storageModule.GetCookiesAsync(options);
    }

    public async Task<PartitionKey> DeleteCookiesAsync(DeleteCookiesOptions? options = null)
    {
        options ??= new();

        options.Partition = new PartitionDescriptor.Context(context);

        var res = await storageModule.DeleteCookiesAsync(options).ConfigureAwait(false);

        return res.PartitionKey;
    }

    public async Task<PartitionKey> SetCookieAsync(PartialCookie cookie, SetCookieOptions? options = null)
    {
        options ??= new();

        options.Partition = new PartitionDescriptor.Context(context);

        var res = await storageModule.SetCookieAsync(cookie, options).ConfigureAwait(false);

        return res.PartitionKey;
    }
}
