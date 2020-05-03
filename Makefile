all: kenlm-completor out/server.js

kenlm-completor: src/kenlm-completor.cc
	g++ $< -std=c++11 -I./vendor/kenlm/ -L./vendor/kenlm/build/lib \
		-DKENLM_MAX_ORDER=6 \
		-llzma -lbz2 -lz -lkenlm -lkenlm_util -o kenlm-completor

out/server.js: src/*.ts
	npm run build

install: out/server.js
	npm i -g
