import { Buffer, BufferType, Email } from './types';

function addresseeFromEmail(email: Email): string | undefined {
  if (email.name && email.name.firstName) {
    return email.name.firstName;
  }
}

function completeGreeting(buffer: Buffer): string | undefined {
  if (buffer.To) {
    let addressee = addresseeFromEmail(buffer.To[0]);

    if (addressee) {
      let re = /^(hi|hello)$/;
      if (buffer.body.toLowerCase().match(re)) {
        return addressee;
      }
    }
  }
}

async function completeKenLM(buffer: Buffer): Promise<string | undefined> {
  let nContext = 5;
  let prefix = buffer.body.toLowerCase().trim().split(' ').slice(-nContext).join(' ');

  return 'not implemented';
}

function completorChain(bufferType: BufferType) {
  if (bufferType === BufferType.Mu4e) {
    return [completeGreeting, completeKenLM];
  }

  return [completeKenLM];
}

export async function complete(buffer: Buffer): Promise<string | undefined> {
  let completors = completorChain(buffer.type);

  for (let comp of completors) {
    let completion = await comp(buffer);
    if (completion) {
      return completion;
    };
  }

  return;
}
