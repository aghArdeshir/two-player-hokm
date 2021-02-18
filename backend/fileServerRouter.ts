import { readFile } from "fs";

export const fileServerRouter = (req, res) => {
  let fileName =
    __dirname + (req.url === "/hokm/" ? "/hokm/index.html" : req.url);

  if (process.env.NODE_ENV === "development") {
    fileName =
      __dirname +
      (req.url === "/hokm/"
        ? "/../dist/backend/hokm/index.html"
        : "/../dist/backend" + req.url);
  }

  if (fileName.endsWith(".html")) {
    res.setHeader("Content-Type", "text/html");
  } else if (fileName.endsWith(".js")) {
    res.setHeader("Content-Type", "text/javascript");
  } else if (fileName.endsWith(".png")) {
    res.setHeader("Content-Type", "image/png");
  }

  readFile(fileName, (error, data) => {
    if (error) {
      console.log({ error });
      res.end();
    } else {
      res.end(data);
    }
  });
};
