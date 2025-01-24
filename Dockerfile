FROM node:18-alpine
# set woring directory
WORKDIR /app
#copy .json files
COPY package*.json ./
RUN npm install 
# it means, server k all files/codes ko iss app [WORKDIR /app] k andar leke jaao
# copy rest of the code

COPY . .

EXPOSE 6000
# start the backend application
CMD [ "nodemon","server.js" ]