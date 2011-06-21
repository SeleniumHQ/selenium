package org.openqa.grid.plugin;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;


public class MyRemoteProxy extends RemoteProxy {
	private String custom1;
	private String custom2;

	public MyRemoteProxy(RegistrationRequest request,Registry registry) {
		super(request,registry);
		custom1 = request.getConfiguration().get("Custom1").toString();
		custom2 = request.getConfiguration().get("Custom2").toString();
	}

	public String getCustom1() {
		return custom1;
	}

	public String getCustom2() {
		return custom2;
	}

}
