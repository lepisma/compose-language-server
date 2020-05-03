import { Buffer, BufferType, Email, Completion, CompletorReturn } from './types';

// Symbol for stopping chain of completors
const STOP = Symbol('STOP');

function addresseeFromEmail(email: Email): Completion {
  if (email.name && email.name.firstName) {
    return email.name.firstName;
  }
}

function completeGreeting(buffer: Buffer): CompletorReturn {
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

async function completeKenLM(buffer: Buffer): Promise<CompletorReturn> {
  if (buffer.body.slice(-1) !== ' ') {
    return
  }

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

export async function complete(buffer: Buffer): Promise<Completion> {
  let completors = completorChain(buffer.type);

  for (let comp of completors) {
    let completion = await comp(buffer);
    if (completion === STOP) {
      // Completor can have a say by force stopping rest of the completors if it
      // returns STOP symbol.
      return;
    } else if (completion)  {
      // @ts-ignore
      return completion;
    };
  }

  return;
}
