using System.Collections;
using System.Threading;

namespace ThoughtWorks.Selenium.BridgeWebApp
{
	public class SingleEntryBlockingQueue
	{
		private Queue queue = new Queue();
		private ManualResetEvent mutex = new ManualResetEvent(false);

		public void Put(object o)
		{
			while (queue.Count > 0)
			{
				mutex.WaitOne();
			}

			mutex.Reset();
			queue.Enqueue(o);
			mutex.Set();
		}

		public object Get()
		{
			while (queue.Count == 0)
			{
				mutex.WaitOne();
			}
			
			mutex.Reset();
			object value = queue.Dequeue();
			mutex.Set();
			return value;
		}

		public bool IsEmpty()
		{
			return queue.Count == 0;
		}
	}
}