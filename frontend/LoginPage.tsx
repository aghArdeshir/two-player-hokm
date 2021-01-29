import { FormEvent, useCallback, useRef, useState } from "react";
import CenterMessage from "./CenterMessage";
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

  function onFormSubmit(e: FormEvent) {
    e.preventDefault();
    setJoined();
    socketService.registerUser(inputRef.current?.value);
  }

  if (joined) {
    return <CenterMessage>Looking for Player</CenterMessage>;
  }

  return (
    <form onSubmit={onFormSubmit} className="login-form">
      <h1>♥</h1>
      <h2>hokm</h2>
      <input ref={inputRef} autoFocus placeholder="Player Name" />
      <button type="submit">Join</button>
    </form>
  );
}
