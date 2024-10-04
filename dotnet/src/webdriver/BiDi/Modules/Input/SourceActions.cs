using System;
using System.Collections;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.Input;

public abstract record SourceActions
{
    public string Id { get; } = Guid.NewGuid().ToString();

    public record Keys : SourceActions, IEnumerable<Key>
    {
        public IList<Key> Actions { get; set; } = [];

        public void Add(Key key) => Actions.Add(key);

        public IEnumerator<Key> GetEnumerator() => Actions.GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator() => Actions.GetEnumerator();
    }

    public record Pointers : SourceActions, IEnumerable<Pointer>
    {
        public Parameters? Options { get; set; }

        public IList<Pointer> Actions { get; set; } = [];

        public void Add(Pointer pointer) => Actions.Add(pointer);

        public IEnumerator<Pointer> GetEnumerator() => Actions.GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator() => Actions.GetEnumerator();

        public record Parameters
        {
            public Type? PointerType { get; set; }
        }

        public enum Type
        {
            Mouse,
            Pen,
            Touch
        }
    }

    public record Wheels : SourceActions, IEnumerable<Wheel>
    {
        public IList<Wheel> Actions { get; set; } = [];

        public void Add(Wheel wheel) => Actions.Add(wheel);

        public IEnumerator<Wheel> GetEnumerator() => Actions.GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator() => Actions.GetEnumerator();
    }

    [JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
    [JsonDerivedType(typeof(Pause), "pause")]
    [JsonDerivedType(typeof(Down), "keyDown")]
    [JsonDerivedType(typeof(Up), "keyUp")]
    public abstract record Key
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
    public abstract record Pointer
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
    }

    [JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
    [JsonDerivedType(typeof(Pause), "pause")]
    [JsonDerivedType(typeof(Scroll), "scroll")]
    public abstract record Wheel
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
}
