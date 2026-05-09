# syntax=docker/dockerfile:1

FROM node:latest

WORKDIR /frontend

COPY . .

RUN rm -rf node_modules
RUN npm i

CMD ["npm", "run", "dev", "--", "--host"]
EXPOSE 5173