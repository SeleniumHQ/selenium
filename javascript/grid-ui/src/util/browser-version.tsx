const browserVersion = (version: string): string => {
  const browserVersion = version ?? ''
  return browserVersion.length > 0 ? 'v.' + browserVersion : browserVersion
}

export default browserVersion
