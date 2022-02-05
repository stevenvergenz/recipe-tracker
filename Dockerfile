# compile image
FROM node:17-alpine as compile-image
WORKDIR /opt/app

COPY package*.json ./
RUN ["npm", "install", "--unsafe-perm"]

COPY tsconfig.json ./
COPY src ./src/
RUN ["npm", "run", "build"]

# runtime image
FROM node:17-alpine AS runtime-image
ENV PORT=3000
ENV COOKIE_SECRET="placeholder"
WORKDIR /opt/app

COPY package*.json ./
RUN ["npm", "install", "--production"]

COPY --from=compile-image /opt/app/built ./built/

EXPOSE ${PORT}/tcp
CMD ["npm", "start"]
