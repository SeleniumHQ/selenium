using NUnit.Framework;
using ThoughtWorks.Selenium.Core;

namespace ThoughtWorks.Selenium.UnitTests
{
	[TestFixture]
	public class SkeletonTest
	{
		[Test]
		public void ShouldSayHelloWorld()
		{
			Assert.AreEqual("HelloWorld", new Skeleton().SayHelloWorld());
		}
	}
}
