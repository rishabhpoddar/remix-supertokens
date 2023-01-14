export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Login</h1>
      <form method="post" action="/login">
        <div>
          <label>Username : </label>
          <input type="text" placeholder="Enter Username" name="username" required />
          <div />
          <label>Password : </label>
          <input type="password" placeholder="Enter Password" name="password" required />
          <div />
          <button type="submit">Login</button>
        </div>
      </form>

    </div>
  );
}
