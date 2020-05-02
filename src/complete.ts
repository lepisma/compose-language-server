let greetingAnticipated = (text: string) => {
  let re = /^(hi|hello)$/;
  return text.toLowerCase().match(re);
}
