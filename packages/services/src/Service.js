/**
 * Service — abstract base class for every singleton service in this package.
 *
 * Responsibilities:
 *  - Declares the `connect()` / `disconnect()` lifecycle contract.
 *  - Tracks a simple `_connected` flag that subclasses update.
 *  - Prevents accidental double-initialisation via `isConnected()`.
 */
export class Service {
    _connected = false;
    /** Returns `true` when the service has an active connection. */
    isConnected() {
        return this._connected;
    }
}
