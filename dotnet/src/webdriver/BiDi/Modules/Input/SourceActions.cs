using System;
using System.Collections;
using System.Collections.Generic;
using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Input;

public interface ISourceActions
{
    string Id { get; }

    IList<ISourceAction> Actions { get; }
}

public abstract record SourceActions<T> : ISourceActions, IEnumerable<ISourceAction>
{
    public string Id { get; } = Guid.NewGuid().ToString();

    public IList<ISourceAction> Actions { get; } = [];

    public IEnumerator<ISourceAction> GetEnumerator() => Actions.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => Actions.GetEnumerator();

    public void Add(ISourceAction action) => Actions.Add(action);
}

public record KeyActions : SourceActions<Key>, ISourceActions;

public record PointerActions : SourceActions<Pointer>, ISourceActions
{
    public PointerParameters? Options { get; set; }
}

public record WheelActions : SourceActions<Wheel>;

public record NoneActions : SourceActions<None>;

public interface ISourceAction;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(Pause), "pause")]
[JsonDerivedType(typeof(Down), "keyDown")]
[JsonDerivedType(typeof(Up), "keyUp")]
public abstract record Key : ISourceAction
{
    public record Pause : Key
    {
        public long? Duration { get; set; }
    }

    public record Down(string Value) : Key;

    public record Up(string Value) : Key;
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(Pause), "pause")]
[JsonDerivedType(typeof(Down), "pointerDown")]
[JsonDerivedType(typeof(Up), "pointerUp")]
[JsonDerivedType(typeof(Move), "pointerMove")]
public abstract record Pointer : ISourceAction
{
    public record Pause : Pointer
    {
        public long? Duration { get; set; }
    }

    public record Down(int Button) : Pointer, IPointerCommonProperties
    {
        public int? Width { get; set; }
        public int? Height { get; set; }
        public double? Pressure { get; set; }
        public double? TangentialPressure { get; set; }
        public int? Twist { get; set; }
        public double? AltitudeAngle { get; set; }
        public double? AzimuthAngle { get; set; }
    }

    public record Up(int Button) : Pointer;

    public record Move(int X, int Y) : Pointer, IPointerCommonProperties
    {
        public int? Duration { get; set; }

        public Origin? Origin { get; set; }

        public int? Width { get; set; }
        public int? Height { get; set; }
        public double? Pressure { get; set; }
        public double? TangentialPressure { get; set; }
        public int? Twist { get; set; }
        public double? AltitudeAngle { get; set; }
        public double? AzimuthAngle { get; set; }
    }
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(Pause), "pause")]
[JsonDerivedType(typeof(Scroll), "scroll")]
public abstract record Wheel : ISourceAction
{
    public record Pause : Wheel
    {
        public long? Duration { get; set; }
    }

    public record Scroll(int X, int Y, int DeltaX, int DeltaY) : Wheel
    {
        public int? Duration { get; set; }

        public Origin? Origin { get; set; }
    }
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(Pause), "pause")]
public abstract record None : ISourceAction
{
    public record Pause : None
    {
        public long? Duration { get; set; }
    }
}

public record PointerParameters
{
    public PointerType? PointerType { get; set; }
}

public enum PointerType
{
    Mouse,
    Pen,
    Touch
}

public interface IPointerCommonProperties
{
    public int? Width { get; set; }

    public int? Height { get; set; }

    public double? Pressure { get; set; }

    public double? TangentialPressure { get; set; }

    public int? Twist { get; set; }

    public double? AltitudeAngle { get; set; }

    public double? AzimuthAngle { get; set; }
}
