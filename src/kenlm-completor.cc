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

State build_prefix_state(ProbingModel& model, const ProbingVocabulary& vocab, std::vector<std::string> words) {
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

int main() {
  Dictionary dict;
  Config cfg;
  cfg.enumerate_vocab = &dict;

  ProbingModel model("file.arpa", cfg);
  const ProbingVocabulary &vocab = model.GetVocabulary();;
  State state(model.BeginSentenceState()), out_state;

  std::string sentence;
  std::vector<std::string> words;

  std::string bestWord;
  double bestScore;
  double score;

  State prefix_state;
  while (std::getline(std::cin, sentence)) {
    bestScore = -std::numeric_limits<double>::max();
    boost::split(words, sentence, boost::is_any_of(" "));
    prefix_state = build_prefix_state(model, vocab, words);

    for (lm::WordIndex i = 3; i < vocab.Bound(); i++) {
      score = model.Score(prefix_state, i, out_state);
      if (score > bestScore) {
        bestScore = score;
        bestWord = dict.data[i];
      }
    }

    std::cout << bestWord << "\n";
  }
}
