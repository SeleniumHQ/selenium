using System.Collections;
using System.Threading;

namespace ThoughtWorks.Selenium.BridgeWebApp
{
	public class SingleEntryBlockingQueue
	{
		private Queue queue = Queue.Synchronized(new Queue());

		public void Put(object o)
		{
			lock (this)
			{
				while (queue.Count > 0)
				{
					Monitor.Wait(this);
				}

				queue.Enqueue(o);
				Monitor.PulseAll(this);
			}
		}

		public object Get()
		{
			lock (this)
			{
				while (queue.Count == 0)
				{
					Monitor.Wait(this);
				}

				return queue.Dequeue();
			}
		}

		public bool IsEmpty()
		{
			lock (this)
			{
				return queue.Count == 0;
			}
		}
	}
}
