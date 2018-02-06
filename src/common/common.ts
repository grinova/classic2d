export module List {
  export type Comparator<T> = (a: T, b: T) => boolean;

  export function diff<T>(a: T[], b: T[], comparator: Comparator<T>): T[] {
    return a.filter(aValue => {
      return b.every(bValue => !comparator(aValue, bValue));
    });
  }
}

export module Exception {
  export class Exception {
    private msg: string;

    constructor(msg: string) {
      this.msg = msg;
    }

    getMessage(): string {
      return this.msg;
    }
  }

  export class NotImplemented extends Exception {
    constructor(msg: string = 'Not implemented') {
      super(msg);
    }
  }

  export function exception(msg: string): Exception {
    return new Exception(msg);
  }

  export function notImplemented(msg?: string): Exception {
    return new NotImplemented(msg);
  }
}
