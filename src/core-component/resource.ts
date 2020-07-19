export interface ResourceService {
  resource(): any;
  value(key: string, param?: any): string;
  format(...args: any[]): string;
}

export interface Message {
  message: string;
  title?: string;
  yes?: string;
  no?: string;
}

export function message(r: ResourceService, msg: string, title?: string, yes?: string, no?: string): Message {
  const m2 = (msg && msg.length > 0 ? r.value(msg) : '');
  const m: Message = {
    message: m2
  };
  if (title && title.length > 0) {
    m.title = r.value(title);
  }
  if (yes && yes.length > 0) {
    m.yes = r.value(yes);
  }
  if (no && no.length > 0) {
    m.no = r.value(no);
  }
  return m;
}
