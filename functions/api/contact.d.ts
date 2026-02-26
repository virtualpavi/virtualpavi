declare global {
  interface Env {
    WEB3FORMS_ACCESS_KEY: string;
  }

  type PagesFunction<Env = unknown> = (context: {
    request: Request;
    env: Env;
    params: Record<string, string>;
    waitUntil: (promise: Promise<unknown>) => void;
    next: () => Promise<Response>;
    data: Record<string, unknown>;
  }) => Response | Promise<Response>;
}

export {};
