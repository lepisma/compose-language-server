// Autocompletion backend based on KenLM models

#include "lm/model.hh"
#include <iostream>
#include <string>


int main() {
  using namespace lm::ngram;
  Model model("file.arpa");
  State state(model.BeginSentenceState()), out_state;

  const Vocabulary &vocab = model.GetVocabulary();;
  std::string word;

  while (std::cin >> word) {
    std::cout << model.Score(state, vocab.Index(word), out_state) << "\n";
    state = out_state;
  }
}
