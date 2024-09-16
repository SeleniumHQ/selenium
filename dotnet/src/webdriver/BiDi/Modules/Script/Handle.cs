namespace OpenQA.Selenium.BiDi.Modules.Script;

public class Handle
{
    private readonly BiDi _bidi;

    public Handle(BiDi bidi, string id)
    {
        _bidi = bidi;
        Id = id;
    }

    public string Id { get; }
}
