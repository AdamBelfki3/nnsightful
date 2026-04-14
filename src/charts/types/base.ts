/**
 * Common interface shared by all widget types.
 *
 * Generic `TData` gives each concrete interface type-safe `setData`
 * while sharing the contract for theme mode and lifecycle.
 */
export interface BaseWidgetInterface<TData = unknown> {
    setThemeMode(dark: boolean): void;
    setData(data: TData): void;
    destroy(): void;
}
