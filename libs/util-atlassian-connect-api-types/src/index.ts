export interface AP {
  context: {
    getToken: (cb: (token: string) => void) => void;
    getContext: (cb: (context: any) => void) => void;
  };
  cookie: {
    save: (name: string, value: string, expires: number) => void;
    read: (name: string, callback: (value: string) => void) => string;
    erase: (name: string) => void;
  };
  dialog: {
    create: (options: any) => void;
    close: (data: any) => void;
    getCustomData: (cb: (data: any) => void) => void;
    getButton: () => any;
    disableCloseOnSubmit: () => void;
    createButton: (options: any) => any;
    isCloseOnEscape: (cb: (enabled: boolean) => void) => void;
  };
  events: {
    on: (event: string, callback: (data: any) => void) => void;
    onPublic: (
      name: string,
      listener: (data: any) => void,
      filter: (data: any) => boolean,
    ) => void;
    once: (name: string, listener: (data: any) => void) => void;
    oncePublic: (
      name: string,
      listener: (data: any) => void,
      filter: (data: any) => boolean,
    ) => void;
    onAny: (
      listener: (name: string, args: string[], data: any) => void,
    ) => void;
    onAnyPublic: (
      listener: (name: string, args: string[], data: any) => void,
      filter: (data: any) => boolean,
    ) => void;
    off: (name: string, listener: (name: string) => void) => void;

    //TODO:: Need the rest of the events and other interfaces here
  };
  user: {
    getTimeZone: (cb: (timeZone: string) => void) => void;
  };
  request: (request: any) => Promise<any>;
}
