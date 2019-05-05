declare module 'mqtt-pattern' {
  export function exec<T extends Record<string, string | string[]>>(pattern: string, topic: string): T | null;

  export function matches(pattern: string, topic: string): boolean;

  export function extract<T extends Record<string, string | string[]>>(
    pattern: string,
    topic: string,
  ): T | Record<string, string | string[]>;

  export function fill(pattern: string, params: object): string;

  export function clean(pattern: string): string;
}
