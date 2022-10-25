using System;
using System.Collections;
using System.Collections.Generic;
using NUnit.Framework;

namespace OpenQA.Selenium.Interactions
{
    [TestFixture]
    public class ActionBuilderTest
    {
        [Test]
        public void OutputsPointerEventsToDictionary()
        {
            ActionBuilder actionBuilder = new ActionBuilder();

            var pointerInputDevice = new PointerInputDevice(PointerKind.Pen);
            var properties = new PointerInputDevice.PointerEventProperties() {
                Width = 10,
                Height = 11,
                Pressure = 0.5,
                TangentialPressure = 0.1,
                TiltX = 15,
                TiltY = 15,
                Twist = 30,
                AltitudeAngle = 0.1,
                AzimuthAngle = 0.1
            };

            var action = pointerInputDevice.CreatePointerDown(MouseButton.Left, properties);
            actionBuilder.AddAction(action);
            var sequence = actionBuilder.ToActionSequenceList();

            var dictionary = sequence[0].ToDictionary();
            Console.WriteLine(dictionary);
            Assert.AreEqual("pointer", dictionary["type"]);
            Assert.NotNull(dictionary["id"]);
            Assert.NotNull(dictionary["parameters"]);
            var parameters = new Dictionary<string, object> {{"pointerType", "pen"}};
            CollectionAssert.AreEquivalent(parameters, (IEnumerable) dictionary["parameters"]);

            var events = new Dictionary<string, object>
            {
                {"width", 10},
                {"height", 11},
                {"pressure", 0.5},
                {"tangentialPressure", 0.1},
                {"tiltX", 15},
                {"tiltY", 15},
                {"twist", 30},
                {"altitudeAngle", 0.1},
                {"azimuthAngle", 0.1},
                {"type", "pointerDown"},
                {"button", 0}
            };
            var actions = (IList<Object>) dictionary["actions"];
            CollectionAssert.AreEquivalent(events, (IEnumerable) actions[0]);
        }
    }
}
