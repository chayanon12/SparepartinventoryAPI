FROM node:20

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y --no-install-recommends alien postgresql-client postgresql nano vim git libaio1 

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4002

CMD ["node", "Service.cjs"]