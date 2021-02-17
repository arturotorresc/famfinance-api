import { main } from "./app";

main()
  .then((app) => {
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
      console.log(`Server started listening on port ${port}`);
    });
  })
  .catch((err) => console.log(err));
