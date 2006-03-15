using System.Threading;
using NUnit.Framework;
using ThoughtWorks.Selenium.BridgeWebApp;

namespace ThoughtWorks.Selenium.UnitTests
{
	[TestFixture]
	public class SingleEntryBlockingQueueTest
	{
		private SingleEntryBlockingQueue queue;

		[SetUp]
		public void SetupTest()
		{
			queue = new SingleEntryBlockingQueue();
			Assert.IsTrue(queue.IsEmpty());
		}

		[Test]
		public void ShouldBeAbleToPutIntoAnEmptyQueue()
		{
			queue.Put("data");
			Assert.IsFalse(queue.IsEmpty());
		}

		[Test]
		public void ShouldNotBeAbleToGetFromAnEmptyQueue()
		{
			Thread getThread = new Thread(new ThreadStart(Get));
			getThread.Start();

			queue.Put("data");
			getThread.Join();

			Assert.IsTrue(queue.IsEmpty());

		}

		private void Get()
		{
			queue.Get();
		}

	}
}
