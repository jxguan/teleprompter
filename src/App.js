import React, { Fragment } from "react";
import {
  GlobalStyles,
  StyledApp,
  StyledTeleprompter as Teleprompter,
  Controls,
  Buttons,
  Input,
  Button,
} from "./styles";
import { segmentText } from "./Teleprompter";

export default function App() {
  const [isEditing, setIsEditing] = React.useState(true);
  const [listening, setListening] = React.useState(false);
  const [words, setWords] = React.useState([]);
  const [progress, setProgress] = React.useState(0);
  const [inputText, setInputText] = React.useState("");
  const [language, setLanguage] = React.useState("en-us");

  // Function to detect if text contains Chinese characters
  const containsChinese = (text) => {
    const chineseRegex = /[\u3400-\u9FBF]/;
    return chineseRegex.test(text);
  };

  const handleInput = (e) => {
    setInputText(e.target.value);
  };

  const handleStart = () => {
    let detectedLang = "en-us";
    if (containsChinese(inputText)) {
      detectedLang = "zh";
      setLanguage("zh");
    } else {
      setLanguage("en-us");
    }
    setWords(segmentText(detectedLang, inputText));
    setIsEditing(false);
    setProgress(0);
    setListening(true);
  };

  const handleRestart = () => {
    setListening(false);
    setTimeout(() => {
      setProgress(0);
      setListening(true);
    }, 200);
  };

  const handleEditText = () => {
    setListening(false);
    setTimeout(() => {
      // Give recognition time to stop before switching modes
      setIsEditing(true);
      setProgress(0);
    }, 200);
  };

  const handleChange = (progress) => setProgress(progress);

  return (
    <Fragment>
      <GlobalStyles />
      <StyledApp $isEditing={isEditing}>
        {isEditing ? (
          <Controls $isEditing={isEditing}>
            <Input
              onChange={handleInput}
              value={inputText}
              placeholder="Enter your text here..."
            />
            <Buttons>
              <Button onClick={handleStart}>Start</Button>
            </Buttons>
          </Controls>
        ) : (
          <>
            <Teleprompter
              words={words}
              language={language}
              listening={listening}
              progress={progress}
              onChange={handleChange}
            />
            <Controls>
              <Buttons>
                <Button onClick={handleRestart} $secondary>
                  Restart
                </Button>
                <Button onClick={handleEditText}>Edit Text</Button>
              </Buttons>
            </Controls>
          </>
        )}
      </StyledApp>
    </Fragment>
  );
}
