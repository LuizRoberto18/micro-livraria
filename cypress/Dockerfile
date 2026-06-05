FROM node

ENV NO_UPDATE_NOTIFIER=1

EXPOSE 3000
EXPOSE 5000

WORKDIR /app
COPY . /app     

ADD . .
RUN npm install --silent --loglevel=error

CMD ["npm", "run", "exec","node", "index.js"]