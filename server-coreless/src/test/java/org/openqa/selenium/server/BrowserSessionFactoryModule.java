package org.openqa.selenium.server;

import com.google.inject.Binder;
import com.google.inject.Module;

import static org.easymock.classextension.EasyMock.*;

public class BrowserSessionFactoryModule implements Module {

	public void configure(Binder binder) {
		FrameGroupCommandQueueSet frameGroupCommandQueueSet = createMock(FrameGroupCommandQueueSet.class);
		binder.bind(FrameGroupCommandQueueSet.class).toInstance(frameGroupCommandQueueSet);
	}

}
