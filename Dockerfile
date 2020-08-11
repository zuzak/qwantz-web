FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production
COPY . .

ADD https://bellard.org/nncp/gpt2tc-2020-07-25.tar.gz /tmp/gpt2tc.tar.gz
RUN tar xvf /tmp/gpt2tc.tar.gz --directory /usr/src/app/gpt --strip-components 1

# workaround as Google Cloud Run won't init submodules
ADD https://github.com/zuzak/qwantz-gpt/archive/master.tar.gz /tmp/transcripts.tar.gz
RUN tar xvf /tmp/transcripts.tar.gz --directory /usr/src/app/comics --strip-components 1

EXPOSE 3000

CMD [ "node", "bin/www" ]
