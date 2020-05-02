// Autocompletion backend based on KenLM models

#include "lm/model.hh"
#include <iostream>
#include <string>
#include <algorithm>
#include <vector>
#include <limits>
#include <unordered_map>
#include "lm/word_index.hh"
#include "util/string_piece.hh"
#include <boost/algorithm/string.hpp>

using namespace lm::ngram;

State build_prefix_state(Model& model, const Vocabulary& vocab, std::vector<std::string> words) {
  State state(model.BeginSentenceState()), out_state;

  lm::WordIndex index;
  for (auto const& word : words) {
    index = vocab.Index(word);
    model.Score(state, index, out_state);
    state = out_state;
  }

  return state;
}

class Dictionary : public lm::EnumerateVocab {
public:
  std::unordered_map<lm::WordIndex, std::string> data;

  void Add(lm::WordIndex index, const StringPiece &str) {
    data[index] = std::string(str.data(), str.length());
  };
};

std::string complete(Model& model, const Vocabulary& vocab, Dictionary& dict, std::string prefix) {
  double bestScore = -std::numeric_limits<double>::max();
  std::string bestWord;

  std::vector<std::string> words;
  boost::split(words, prefix, boost::is_any_of(" "));
  State prefix_state = build_prefix_state(model, vocab, words);
  State out_state;

  // 0 is <unk>, 1 is <s>, 2 is </s>
  double score;
  for (auto i = 3; i < vocab.Bound(); i++) {
    score = model.Score(prefix_state, i, out_state);
    if (score > bestScore) {
      bestScore = score;
      bestWord = dict.data[i];
    }
  }
  return bestWord;
}

int main() {
  Dictionary dict;
  Config cfg;
  cfg.enumerate_vocab = &dict;

  Model model("file.arpa", cfg);
  const Vocabulary &vocab = model.GetVocabulary();

  std::string prefix;
  while (std::getline(std::cin, prefix)) {
    std::cout << ">> " << complete(model, vocab, dict, prefix) << std::endl;
  }
}
