using System.Collections;
using System.Threading;
using NUnit.Framework;
using ThoughtWorks.Selenium.BridgeWebApp;

namespace ThoughtWorks.Selenium.UnitTests
{
	[TestFixture]
	public class SingleEntryBlockingQueueTest
	{
		private SingleEntryBlockingQueue queue;
		private Stack stack;

		[SetUp]
		public void SetupTest()
		{
			queue = new SingleEntryBlockingQueue();
			stack = new Stack();
		}

		[Test]
		public void ShouldNotBeAbleToDequeueBeforeEnqueue()
		{
			Thread enqueueThread1 = createThreadWithName("enqueueThread1", new ThreadStart(enqueue));
			Thread dequeueThread1 = createThreadWithName("dequeueThread1", new ThreadStart(dequeue));
			Thread dequeueThread2 = createThreadWithName("dequeueThread2", new ThreadStart(dequeue));
			Thread dequeueThread3 = createThreadWithName("dequeueThread3", new ThreadStart(dequeue));

			enqueueThread1.Start();
			dequeueThread1.Start();
			dequeueThread2.Start();
			dequeueThread3.Start();

			enqueueThread1.Join();
			dequeueThread1.Join();
			dequeueThread2.Join();
			dequeueThread3.Join();

			Assert.AreEqual("Dequeue", stack.Pop());
			Assert.AreEqual("Enqueue", stack.Pop());
			Assert.AreEqual("Dequeue", stack.Pop());
			Assert.AreEqual("Enqueue", stack.Pop());
			Assert.AreEqual("Dequeue", stack.Pop());
			Assert.AreEqual("Enqueue", stack.Pop());
		}

		private Thread createThreadWithName(string name, ThreadStart entryPoint)
		{
			Thread thread = new Thread(new ThreadStart(entryPoint));
			thread.Name = name;
			return thread;
		}

		public void enqueue()
		{
			EnqueueAndPush("Enqueue");
			EnqueueAndPush("Enqueue");
			EnqueueAndPush("Enqueue");
		}

		private void EnqueueAndPush(string value)
		{
			queue.Put(value);
			stack.Push(value);
		}

		public void dequeue()
		{
			DequeueAndPush("Dequeue");
		}

		private void DequeueAndPush(string value)
		{
			queue.Get();
			stack.Push(value);
		}
	}
}