package org.openqa.selenium.android.app;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.webkit.WebView;

public class NetworkStateHandler {
  private Activity activity;
  private IntentFilter filter;
  private BroadcastReceiver receiver;
  private boolean isConnected;
  private boolean isNetworkUp;
  private final WebView view;
  
  public NetworkStateHandler(Activity activity, final WebView view) {
    this.activity = activity;
    this.view = view;
    
    ConnectivityManager cm = (ConnectivityManager) activity
        .getSystemService(Context.CONNECTIVITY_SERVICE);
    NetworkInfo info = cm.getActiveNetworkInfo();
    if (info != null) {
      isConnected = info.isConnected();
      isNetworkUp = info.isAvailable();
    }
    
    filter = new IntentFilter();
    filter.addAction(ConnectivityManager.CONNECTIVITY_ACTION);
    
    receiver = new BroadcastReceiver() {
      public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals(ConnectivityManager.CONNECTIVITY_ACTION)) {
          NetworkInfo info = intent.getParcelableExtra(ConnectivityManager.EXTRA_NETWORK_INFO);
          String typeName = info.getTypeName();
          String subType = info.getSubtypeName();
          isConnected = info.isConnected();
          if (view != null) {
            try {
              Method setNetworkType = view.getClass().getMethod("setNetworkType",
                  String.class, String.class);
              setNetworkType.invoke(view, typeName, (subType == null? "" : subType));
              
              boolean noConnection = intent.getBooleanExtra(
                  ConnectivityManager.EXTRA_NO_CONNECTIVITY, false);
              onNetworkChange(!noConnection);
            } catch (Exception e) {
              throw new RuntimeException(e);
            }
          }
        }
      }
    };
  }

  public void onNetworkChange(boolean up) {
    if (up == isNetworkUp) {
      return;
    } else if (up) {
      isNetworkUp = true;
    } else {
      isNetworkUp = false;
    }
    
    if (view != null) {
      view.setNetworkAvailable(isNetworkUp);
    }
  }
  
  public boolean isNetworkUp() {
    return isNetworkUp;
  }
  
  public boolean isConnected() {
    return isConnected;
  }

  public void onPause() {
    // unregister network state listener
    activity.unregisterReceiver(receiver);
  }

  public void onResume() {
    activity.registerReceiver(receiver, filter);
  }
}
