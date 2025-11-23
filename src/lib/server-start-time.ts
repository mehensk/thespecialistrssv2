/**
 * Server restart detection mechanism
 * Stores the server start timestamp to detect restarts
 */

let serverStartTime: number | null = null;

/**
 * Get or initialize the server start time
 * This will be set once when the server starts
 */
export function getServerStartTime(): number {
  if (serverStartTime === null) {
    serverStartTime = Date.now();
  }
  return serverStartTime;
}

/**
 * Check if the server has restarted since a given timestamp
 */
export function hasServerRestarted(sinceTimestamp: number): boolean {
  const currentStartTime = getServerStartTime();
  return sinceTimestamp < currentStartTime;
}

