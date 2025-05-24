import styled, { createGlobalStyle } from "styled-components";
import Teleprompter from "./Teleprompter";

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    height: 100%;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    margin: 0;
    overflow: hidden;
    position: fixed;
    width: 100%;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    color: #334155;
  }
`;

export const StyledApp = styled.div`
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  text-align: center;
  height: calc(100dvh);
  margin: 1rem;
  display: flex;
  flex-direction: column;
  padding: ${(props) => (props.$isEditing ? "1.5rem" : "0.5rem")};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`;

export const StyledTeleprompter = styled(Teleprompter)`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
`;

export const Controls = styled.div`
  display: flex;
  flex-direction: column;
  height: ${(props) => (props.$isEditing ? "100%" : "6rem")};
  margin-bottom: 1rem;
  padding-bottom: 1rem;
`;

export const Buttons = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 1rem;
`;

export const Input = styled.textarea`
  flex: 1;
  border: 1px solid rgba(51, 65, 85, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.5);
  width: 100%;
  font-size: 1.5rem;
  resize: none;
  color: #334155;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(51, 65, 85, 0.5);
  }

  &:focus {
    outline: none;
    border-color: rgba(51, 65, 85, 0.3);
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 0 4px rgba(51, 65, 85, 0.1);
  }
`;

export const Button = styled.button`
  display: inline-block;
  border: none;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  background: ${(props) =>
    props.$secondary ? "rgba(51, 65, 85, 0.05)" : "#60a5fa"};
  border-radius: 1rem;
  color: ${(props) => (props.$secondary ? "#334155" : "white")};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
  min-width: 6rem;
  backdrop-filter: blur(5px);
  border: 1px solid
    rgba(51, 65, 85, ${(props) => (props.$secondary ? "0.1" : "0")});

  &:hover {
    transform: translateY(-2px);
    background: ${(props) =>
      props.$secondary ? "rgba(51, 65, 85, 0.1)" : "#93c5fd"};
    box-shadow: 0 5px 15px rgba(96, 165, 250, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;
