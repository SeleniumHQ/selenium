package org.openqa.selenium.remote.service;

/**
 * Thread intended as a shutdown hook that stops a {@link DriverService}.
 *
 * @see Runtime#addShutdownHook(Thread)
 */
public class DriverServiceShutdownHook extends Thread {

    private DriverService driverService;

    public DriverServiceShutdownHook(DriverService driverService) {
        this.driverService = driverService;
    }

    @Override
    public void run() {
        driverService.stop();
    }
}
