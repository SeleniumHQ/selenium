using NUnit.Framework;
using Selenium;

namespace ThoughtWorks.Selenium.IntegrationTests
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
