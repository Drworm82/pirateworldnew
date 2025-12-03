import { ensureUser } from "../lib/supaApi.js";

export default function Profile() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    ensureUser().then(setUser);
  }, []);

  return (
    <div style={{ color: "white" }}>
      <h2>Perfil</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
