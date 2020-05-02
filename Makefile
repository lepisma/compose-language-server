all: kenlm-completor

kenlm-completor: src/kenlm-completor.cc
	g++ $< -std=c++11 -I./vendor/kenlm/ -L./vendor/kenlm/build/lib \
		-DKENLM_MAX_ORDER=6 \
		-llzma -lbz2 -lz -lkenlm -lkenlm_util -o kenlm-completor
