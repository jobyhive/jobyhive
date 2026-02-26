/**
 * Service — abstract base class for every singleton service in this package.
 *
 * Responsibilities:
 *  - Declares the `connect()` / `disconnect()` lifecycle contract.
 *  - Tracks a simple `_connected` flag that subclasses update.
 *  - Prevents accidental double-initialisation via `isConnected()`.
 */
export declare abstract class Service {
    protected _connected: boolean;
    /**
     * Establish the underlying connection / client.
     * Called once — subsequent calls are no-ops if already connected.
     */
    abstract connect(): Promise<void>;
    /**
     * Gracefully close the underlying connection / client.
     */
    abstract disconnect(): Promise<void>;
    /** Returns `true` when the service has an active connection. */
    isConnected(): boolean;
}
//# sourceMappingURL=Service.d.ts.map