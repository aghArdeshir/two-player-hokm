import { useEffect, useState } from "react";
import { socketService } from "./socket-service";

export default function LiveIndicator() {
  const [delayed, setDelayed] = useState(false);
  const [disconnected, setDisconnected] = useState(false);

  useEffect(() => {
    socketService.initiateManualHeartBeat({
      onNormal: () => {
        setDelayed(false);
        setDisconnected(false);
      },
      onDelay: () => {
        setDelayed(true);
      },
      onDisconnect: () => {
        setDisconnected(true);
      },
    });
  }, []);

  let color = "green";
  if (disconnected) {
    color = "red";
  } else if (delayed) {
    color = "orange";
  }

  return <div className="live-indicator" style={{ backgroundColor: color }} />;
}
