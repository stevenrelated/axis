declare module '@supabase/ssr' {
  export function createServerClient(
    url: string,
    key: string,
    options?: any,
  ): any;
}
