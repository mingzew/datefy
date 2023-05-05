FROM ghcr.io/puppeteer/puppeteer:19.2.2

WORKDIR /app

USER root

# Copy the rest of the application code to the container
COPY . .

# Install dependencies
RUN npm install

RUN echo $(pwd)

RUN echo $(ls)

RUN cd node_modules/puppeteer && npm install

# Expose port 8080 for the application
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
