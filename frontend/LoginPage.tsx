import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { socketService } from "./socket-service";

export function useBooleanState(defaultValue = false): [boolean, () => void] {
  const [state, setState] = useState(defaultValue);

  const stateToggle = useCallback(() => {
    setState((currentState) => !currentState);
  }, []);

  return [state, stateToggle];
}

export default function LoginPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [joined, setJoined] = useBooleanState(false);

  function onFormSubmit(e?: FormEvent) {
    e?.preventDefault();
    setJoined();
    socketService.registerUser(inputRef.current?.value);
  }

  useEffect(() => {
    setTimeout(() => {
      setJoined();
      socketService.registerUser(
        Math.random().toFixed(2) + "ali" + Math.random().toFixed(2)
      );
    }, 1000); // only for ease of development
  }, []);

  if (joined) {
    return <h4>waiting for other player to join ...</h4>;
  }

  return (
    <form onSubmit={onFormSubmit}>
      <label htmlFor="username">username:</label>
      <input
        id="username"
        ref={inputRef}
        autoFocus
        defaultValue={"ali" + Math.random().toFixed(2)} // only for ease of development
      />
      <br />
      <button type="submit">Join</button>
    </form>
  );
}
