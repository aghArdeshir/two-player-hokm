import { createServer } from "http";

const http = createServer((_req, res) => {
  res.end("Nothing here!");
});

http.listen(3000);

http.on("listening", () => {
  console.log("backend listening on port 3000");
});
