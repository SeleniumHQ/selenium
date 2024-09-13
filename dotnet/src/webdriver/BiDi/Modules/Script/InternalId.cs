namespace OpenQA.Selenium.BiDi.Modules.Script;

public class InternalId
{
    readonly BiDi _bidi;

    public InternalId(BiDi bidi, string id)
    {
        _bidi = bidi;
        Id = id;
    }

    public string Id { get; }
}
