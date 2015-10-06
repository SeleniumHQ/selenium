package org.openqa.selenium.support.events;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.events.listeners.ListensToException;

public class EventFiringInvocationHandler implements InvocationHandler {

	final ListensToException listensToException;
	final Object realObject;
	final WebDriver driver;
	
	public EventFiringInvocationHandler(ListensToException listensToException, WebDriver driver, 
			Object realObject){
		this.listensToException = listensToException;
		this.realObject = realObject;
		this.driver = driver;
	}	
	
	@Override
	public Object invoke(Object proxy, Method method, Object[] args)
			throws Throwable {
		try {
            return method.invoke(realObject, args);
          } catch (InvocationTargetException e) {
            listensToException.onException(e.getTargetException(), driver);
            throw e.getTargetException();
          }
	}

}
