```md
docker run -d --name orientdb -p 2424:2424 -p 2480:2480 -e ORIENTDB_ROOT_PASSWORD=root orientdb:latest
# ^ may be need sudo ^
npm start
```

This code use ancient-souls concepts to subscribe changes of select result.
See last strings of `index.ts` file.