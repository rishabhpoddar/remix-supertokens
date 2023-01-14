import { json, LoaderArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";

export function loader({ context }: LoaderArgs) {
  return json({
    userId: context.userId === undefined ? "" : context.userId
  });
}

export default function Index() {
  let context = useLoaderData();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>{context.userId === "" ? "Welcome to Remix" : "Welcome " + context.userId}</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
      {context.userId === "" ? <Link to="/auth">Login</Link> :
        (<form method="post" action="/signout">
          <button type="submit">Sign out</button>
        </form>)}
    </div>
  );
}
