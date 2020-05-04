export enum BufferType { Mu4e, Plain }

export interface Buffer {
  type: BufferType,
  body: string,
  [propName: string]: any
}

export interface Name {
  firstName?: string,
  fullName: string
}

export interface Email {
  emailId: string,
  name?: Name
}

export type Completion = string | undefined;
export type CompletorReturn = Completion | symbol;

export interface Completor {
  complete(buffer: Buffer): Promise<CompletorReturn> | CompletorReturn;
}
