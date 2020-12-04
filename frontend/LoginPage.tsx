import { FormEvent, useRef } from "react";
import { socketService } from "./socket-service";

export default function LoginPage() {
  const inputRef = useRef<HTMLInputElement>(null);

  function onFormSubmit(e: FormEvent) {
    e.preventDefault();
    socketService.registerUser(inputRef.current?.value);
  }

  return (
    <form onSubmit={onFormSubmit}>
      <label htmlFor="username">Username:</label>
      <input id="username" ref={inputRef} />
      <br />
      <button type="submit">Join</button>
    </form>
  );
}
