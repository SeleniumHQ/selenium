using System;
using System.Collections.Generic;
using System.Drawing;
using System.Globalization;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    class RenderedRemoteWebElement : RemoteWebElement, IRenderedWebElement
    {
        #region IRenderedWebElement Members

        public Point Location
        {
            get
            { 
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", Id);
                Response commandResponse = Parent.Execute(DriverCommand.GetElementLocation, new object[] { parameters });
                Dictionary<string, object> rawPoint = (Dictionary<string, object>)commandResponse.Value;
                int x = Convert.ToInt32(rawPoint["x"], CultureInfo.InvariantCulture);
                int y = Convert.ToInt32(rawPoint["y"], CultureInfo.InvariantCulture);
                return new Point(x, y);
            }
        }

        public Size Size
        {
            get 
            { 
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", Id);
                Response commandResponse = Parent.Execute(DriverCommand.GetElementSize, new object[] { parameters });
                Dictionary<string, object> rawSize = (Dictionary<string, object>)commandResponse.Value;
                int width = Convert.ToInt32(rawSize["width"], CultureInfo.InvariantCulture);
                int height = Convert.ToInt32(rawSize["height"], CultureInfo.InvariantCulture);
                return new Size(width, height);
            }
        }

        public bool Displayed
        {
            get
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", Id);
                Response commandResponse = Parent.Execute(DriverCommand.IsElementDisplayed, new object[] { parameters });
                return (bool)commandResponse.Value;
            }
        }

        public string GetValueOfCssProperty(string propertyName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", Id);
            parameters.Add("propertyName", propertyName);
            Response commandResponse = Parent.Execute(DriverCommand.GetElementValueOfCssProperty, new object[] { parameters });
            return commandResponse.Value.ToString();
        }

        public void Hover()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", Id);
            Parent.Execute(DriverCommand.HoverOverElement, new object[] { parameters });
        }

        public void DragAndDropBy(int moveRightBy, int moveDownBy)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", Id);
            Parent.Execute(DriverCommand.DragElement, new object[] { parameters, moveRightBy, moveDownBy });
        }

        public void DragAndDropOn(IRenderedWebElement element)
        {
            Point currentLocation = Location;
            Point destination = element.Location;
            DragAndDropBy(destination.X - currentLocation.X, destination.Y - currentLocation.Y);
        }

        #endregion
    }
}
