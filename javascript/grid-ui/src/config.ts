// Contains the global config values which can be adjusted
export const GridConfig = {
  status: {
    // How often we poll the GraphQL endpoint
    xhrPollingIntervalMillis: 5000
  },

  // Server config (Start the Selenium Server with the "--allow-cors true" flag)
  serverUri:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:4444/graphql'
      : document.location.protocol + '//' + document.location.host + document.location.pathname.replace("/ui", "") + '/graphql'
}
