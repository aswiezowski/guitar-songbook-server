FROM node:14-slim
COPY . /
RUN npm install

ENV PORT=80
CMD npm start
