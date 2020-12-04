import { useEffect, useState } from "react";
import LoginPage from "./LoginPage";
import { socketService } from "./socket-service";

export default function App() {
  const [socketConnected, setSocketConnected] = useState(false);
  useEffect(() => {
    socketService.onConnected(() => setSocketConnected(true));
  }, []);

  if (socketConnected) return <LoginPage />;

  return <div>Waiting for server</div>;
}
