import React from "react";
import styled from "styled-components";
import stringSimilarity from "string-similarity";

const StyledTeleprompter = styled.div`
  font-size: 3rem;
  padding: 1.5rem;
  line-height: 1.5;
  border-radius: 1rem;
  width: 100%;
  height: calc(100% - 8rem);
  overflow: scroll;
  scroll-behavior: smooth;
  display: block;
  text-align: justify;
  background: transparent no-repeat;
  background-color: black;
  background-position: 0 0, 0 100%;
  background-size: 100% 14px;
  position: relative;
  -webkit-overflow-scrolling: touch; /* Enables smooth scrolling on iOS */

  /* Hide scrollbars while keeping functionality */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }

  /* Prevent overscroll on iOS */
  overscroll-behavior: contain;
  touch-action: pan-y pinch-zoom;
`;

const Interim = styled.div`
  background: rgb(0, 0, 0, 0.25);
  color: white;
  flex: 0 0 auto;
  padding: 0.5rem;
  border-radius: 1rem;
  display: inline-block;
`;

const cleanWord = (word) =>
  word
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z]/gi, "");

function checkSimilarWords(lang, word1, word2) {
  if (lang === "zh") {
    return word1 === word2;
  }
  const similarity = stringSimilarity.compareTwoStrings(
    cleanWord(word1),
    cleanWord(word2)
  );
  return similarity > 0.75 ? true : false;
}

function min(num1, num2, num3) {
  let min1 = num1 < num2 ? num1 : num2;
  return min1 < num3 ? min1 : num3;
}
var editDist = [];
var accResults = [];
var currResults = [];

let lastWordsIndex = -1;
let lastResultsIndex = -1;

function calcProgress(lang, words, results) {
  /*
  console.log("Entering calcProgress with:");
  console.log(results);
  console.log("lastWordsIndex = " + lastWordsIndex);
  console.log("lastResultsIndex = " + lastResultsIndex);
  */
  if (words.length === 0 || results.length === 0) {
    return 0;
  }
  let newWordsIndex =
    words.length > results.length * 2 ? results.length * 2 : words.length;
  for (let i = lastWordsIndex + 1; i < newWordsIndex; i++) {
    editDist[i] = [];
    editDist[i][0] = i;
  }
  for (let j = lastResultsIndex + 1; j < results.length; j++) {
    editDist[0][j] = j;
  }
  for (
    let i = lastWordsIndex + 1 > 0 ? lastWordsIndex + 1 : 1;
    i < newWordsIndex;
    i++
  ) {
    for (let j = 1; j <= lastResultsIndex; j++) {
      if (checkSimilarWords(lang, words[i - 1], results[j - 1])) {
        editDist[i][j] = editDist[i - 1][j - 1];
      } else {
        editDist[i][j] =
          min(editDist[i - 1][j], editDist[i][j - 1], editDist[i - 1][j - 1]) +
          1;
      }
    }
  }
  for (let i = 1; i <= lastWordsIndex; i++) {
    for (
      let j = lastResultsIndex + 1 > 0 ? lastResultsIndex + 1 : 1;
      j < results.length;
      j++
    ) {
      if (checkSimilarWords(lang, words[i - 1], results[j - 1])) {
        editDist[i][j] = editDist[i - 1][j - 1];
      } else {
        editDist[i][j] =
          min(editDist[i - 1][j], editDist[i][j - 1], editDist[i - 1][j - 1]) +
          1;
      }
    }
  }
  for (
    let i = lastWordsIndex + 1 > 0 ? lastWordsIndex + 1 : 1;
    i < newWordsIndex;
    i++
  ) {
    for (
      let j = lastResultsIndex + 1 > 0 ? lastResultsIndex + 1 : 1;
      j < results.length;
      j++
    ) {
      if (checkSimilarWords(lang, words[i - 1], results[j - 1])) {
        editDist[i][j] = editDist[i - 1][j - 1];
      } else {
        editDist[i][j] =
          min(editDist[i - 1][j], editDist[i][j - 1], editDist[i - 1][j - 1]) +
          1;
      }
    }
  }

  let minEditDist = editDist[0][results.length - 1];
  let minIndex = 0;
  for (let i = 1; i < newWordsIndex; i++) {
    if (editDist[i][results.length - 1] <= minEditDist) {
      minEditDist = editDist[i][results.length - 1];
      minIndex = i;
    }
  }
  lastResultsIndex = results.length - 1;
  lastWordsIndex = newWordsIndex - 1;
  /*
  console.log(editDist);

  console.log(lastWordsIndex);
  console.log(lastResultsIndex);*/
  return minIndex + 1;
}

export function segmentText(lang, text) {
  if (lang === "zh") {
    // Split text into segments while preserving English words
    const segments = [];
    let currentEnglishWord = "";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      // Check if character is English letter (including common accents), number, or common English punctuation
      if (/[a-zA-ZÀ-ÿ0-9.,!?;:'"-]/.test(char)) {
        currentEnglishWord += char;
      } else {
        // If we have collected an English word, add it to segments
        if (currentEnglishWord) {
          segments.push(currentEnglishWord.trim());
          currentEnglishWord = "";
        }
        // Add Chinese character as its own segment
        if (char.trim()) {
          // Only add if not whitespace
          segments.push(char);
        }
      }
    }
    // Add any remaining English word
    if (currentEnglishWord) {
      segments.push(currentEnglishWord.trim());
    }
    return segments;
  } else {
    return text.split(" ");
  }
}

export default function Teleprompter({
  words,
  language,
  progress,
  listening,
  onChange,
}) {
  const recog = React.useRef(null);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recog.current = new SpeechRecognition();
    recog.current.continuous = true;
    recog.current.interimResults = true;
    recog.current.lang = language === "zh" ? "zh" : "en-us";
  }, [language]);

  const autoRestart = React.useCallback(() => {
    try {
      accResults = accResults.concat(currResults);
      currResults = [];
      recog.current.start();
    } catch (e) {
      console.log("Failed to restart recognition:", e);
    }
  }, []);

  React.useEffect(() => {
    if (listening) {
      try {
        recog.current.start();
        recog.current.addEventListener("end", autoRestart);
      } catch (e) {
        console.log("Failed to start recognition:", e);
      }
    } else {
      recog.current.removeEventListener("end", autoRestart);
      setTimeout(() => {
        recog.current.stop();
      }, 100);
      lastResultsIndex = -1;
      lastWordsIndex = -1;
      editDist = [];
      currResults = [];
      accResults = [];
    }
  }, [listening, autoRestart]);

  const [results, setResults] = React.useState("");

  React.useEffect(() => {
    const handleResult = ({ results }) => {
      let interim = "";
      if (language === "zh") {
        interim = Array.from(results)
          .map((r) => r[0].transcript)
          .join("");
      } else {
        interim = Array.from(results)
          //.filter((r) => !r.isFinal)
          .map((r) => r[0].transcript)
          .join(" ");
      }
      setResults(interim);
      currResults = segmentText(language, interim);

      const newIndex = calcProgress(
        language,
        words,
        accResults.concat(currResults)
      );
      /*
      const newIndex = interim.split(" ").reduce((memo, word) => {
        if (memo >= words.length) {
          return memo;
        }
        const similarity = stringSimilarity.compareTwoStrings(
          cleanWord(word),
          cleanWord(words[memo])
        );
        console.log(interim);
        console.log(words);
        console.log(progress);
        memo += similarity > 0.75 ? 1 : 0;
        return memo;
      }, progress);
      */
      if (newIndex > progress && newIndex <= words.length) {
        onChange(newIndex);
      }
    };
    recog.current.addEventListener("result", handleResult);
    return () => {
      recog.current.removeEventListener("result", handleResult);
    };
  }, [onChange, progress, words, language]);

  React.useEffect(() => {
    scrollRef.current
      .querySelector(`[data-index='${progress + 3}']`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "start",
      });
  }, [progress]);

  return (
    <React.Fragment>
      <StyledTeleprompter ref={scrollRef}>
        {words.map((word, i) => {
          // Check if current word is English/Latin script in Chinese mode
          const isLatinInChinese =
            language === "zh" && /[a-zA-ZÀ-ÿ]/.test(word);
          return (
            <span
              key={`${word}:${i}`}
              data-index={i}
              style={{
                color: i < progress ? "#888" : "#eee",
              }}
            >
              {isLatinInChinese ? ` ${word} ` : word}
              {language === "zh" ? "" : " "}
            </span>
          );
        })}
      </StyledTeleprompter>{" "}
      {/* {results && <Interim> {results} </Interim>} */}
    </React.Fragment>
  );
}
