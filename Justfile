format:
    rumdl fmt .

lint:
    rumdl check .

build:
    typstify build

watch:
    typstify watch

deploy:build
    wrangler deploy