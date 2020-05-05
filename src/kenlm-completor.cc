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
  // TODO: reconsider the begin sentence state
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

// Provide one word ahead completion for provided prefix. If prefix ends with a
// partial word, only return possible words.
std::string complete(Model& model, const Vocabulary& vocab, Dictionary& dict, std::string prefix) {
  // Tell if the pointer is after a whitespace
  bool in_word = prefix.back() != ' ';

  boost::trim(prefix);

  std::vector<std::string> words;
  boost::split(words, prefix, boost::is_any_of(" "));

  // Whether to do partial word completion.
  bool partial_completion = (words.size() > 0) && in_word;

  State prefix_state, out_state;
  if (partial_completion) {
    prefix_state =
      build_prefix_state(model, vocab, std::vector<std::string>(words.begin(), words.end() - 1));
  } else {
    prefix_state = build_prefix_state(model, vocab, words);
  }

  std::string last_word = words.size() > 0 ? words.back() : " ";

  // 0 is <unk>, 1 is <s>, 2 is </s>
  double score;
  std::string word;
  double best_score = -std::numeric_limits<double>::max();
  std::string best_word;

  for (auto i = 3; i < vocab.Bound(); i++) {
    word = dict.data[i];

    if (partial_completion) {
      if (word.rfind(last_word, 0) != 0) {
        continue;
      }
    }

    score = model.Score(prefix_state, i, out_state);
    if (score > best_score) {
      best_score = score;
      best_word = word;
    }
  }
  return best_word;
}

int main(int argc, char *argv[]) {
  Dictionary dict;
  Config cfg;
  cfg.enumerate_vocab = &dict;

  Model model(argv[1], cfg);
  const Vocabulary &vocab = model.GetVocabulary();

  std::string prefix;
  while (std::getline(std::cin, prefix)) {
    std::cout << complete(model, vocab, dict, prefix) << std::endl;
  }
}
