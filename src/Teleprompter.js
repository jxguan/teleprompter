import React from "react";
import styled from "styled-components";
import stringSimilarity from "string-similarity";

const StyledTeleprompter = styled.div`
  font-size: 5.25rem;
  width: 100%;
  height: 100%-;
  overflow: scroll;
  scroll-behavior: smooth;
  display: block;
  margin-bottom: 1rem;
  text-align: justify;
  background: transparent no-repeat;
  background-color: black;
  background-position: 0 0, 0 100%;
  background-size: 100% 14px;
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

function checkSimilarWords(word1, word2) {
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

function calcProgress(words, results) {
  /*
  console.log("Entering calcProgress with:");
  console.log(results);
  console.log("lastWordsIndex = " + lastWordsIndex);
  console.log("lastResultsIndex = " + lastResultsIndex);*/
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
      if (checkSimilarWords(words[i - 1], results[j - 1])) {
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
      if (checkSimilarWords(words[i - 1], results[j - 1])) {
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
      if (checkSimilarWords(words[i - 1], results[j - 1])) {
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

export default function Teleprompter({ words, progress, listening, onChange }) {
  const recog = React.useRef(null);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recog.current = new SpeechRecognition();
    recog.current.continuous = true;
    recog.current.interimResults = true;
    //recog.current.lang = "en-us";
    recog.current.lang = "zh";
  }, []);

  const autoRestart = React.useCallback(() => {
    accResults = accResults.concat(currResults);
    currResults = [];
    console.log(accResults);
    recog.current.start();
  }, []);

  React.useEffect(() => {
    if (listening) {
      recog.current.start();
      recog.current.addEventListener("end", autoRestart);
    } else {
      recog.current.removeEventListener("end", autoRestart);
      lastResultsIndex = -1;
      lastWordsIndex = -1;
      editDist = [];
      currResults = [];
      accResults = [];
      recog.current.stop();
    }
  }, [listening]);

  const [results, setResults] = React.useState("");

  React.useEffect(() => {
    const handleResult = ({ results }) => {
      const interim = Array.from(results)
        //.filter((r) => !r.isFinal)
        .map((r) => r[0].transcript)
        .join(" ");

      setResults(interim);
      currResults = interim.split(" ").filter((r) => r != "");

      const newIndex = calcProgress(words, accResults.concat(currResults));
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
  }, [onChange, progress, words]);

  React.useEffect(() => {
    scrollRef.current
      .querySelector(`[data-index='${progress + 3}']`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
  }, [progress]);

  return (
    <React.Fragment>
      <StyledTeleprompter ref={scrollRef}>
        {" "}
        {words.map((word, i) => (
          <span
            key={`${word}:${i}`}
            data-index={i}
            style={{
              color: i < progress ? "#ccc" : "#fff",
            }}
          >
            {word}{" "}
          </span>
        ))}{" "}
      </StyledTeleprompter>{" "}
      {results && <Interim> {results} </Interim>}
    </React.Fragment>
  );
}
