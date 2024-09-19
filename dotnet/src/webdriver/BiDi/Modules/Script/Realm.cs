namespace OpenQA.Selenium.BiDi.Modules.Script;

public class Realm
{
    private readonly BiDi _bidi;

    public Realm(BiDi bidi, string id)
    {
        _bidi = bidi;
        Id = id;
    }

    public string Id { get; }
}
