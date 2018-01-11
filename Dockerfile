FROM uber/web-base-image:1.0.0

WORKDIR /fusion-plugin-csrf-protection-react

COPY . .

RUN yarn

RUN yarn build-test
