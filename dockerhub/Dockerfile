FROM node:17.2.0
# Create app directory
WORKDIR /home/node/app
COPY package.json .
ENV NODE_ENV=production
RUN npm install
ADD . /home/node/app
# RUN npm run tsc
CMD [ "npm", "start" ]