using System;

namespace OpenQa.Selenium
{
    public interface INavigation
    {
        /**
         * Move back a single "item" in the browser's history.
         */
        void Back();

        /**
         * Move a single "item" forward in the browser's history. Does nothing if
         * we are on the latest page viewed.
         */
        void Forward();

        /**
         * Load a new web page in the current browser window. This is done using an
         * HTTP GET operation, and the method will block until the load is complete.
         * This will follow redirects issued either by the server or as a
         * meta-redirect from within the returned HTML. Should a meta-redirect
         * "rest" for any duration of time, it is best to wait until this timeout is
         * over, since should the underlying page change whilst your test is
         * executing the results of future calls against this interface will be
         * against the freshly loaded page.
         *
         * @param url The URL to load. It is best to use a fully qualified URL
         */
        void To(String url);

        /**
         * Overloaded version of {@link #to(String)} that makes it easy to pass in a URL.
         *
         * @param url
         */
        void To(Uri url);

        /**
         * Refresh the current page 
         */
        void Refresh();
    }
}
