bundle exec jekyll build
bundle exec htmlproofer --check-html \
        --internal-domains localhost:4000 \
        --assume-extension \
        --disable-external \
        --url-ignore "/#.*/" \
        _site