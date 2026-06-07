FROM node
WORKDIR /app
COPY . /app
RUN npm install
CMD ["node", "/app/services/reviews/index.js"]