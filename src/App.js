import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import Message from "./Message";
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedApp, setSelectedApp] = useState("gmail");
  const [testSetting, setTestSetting] = useState("free-form-prompting");
  const [testState, setTestState] = useState("unfinished");
  const [epochNumber, setEpochNumber] = useState(0);
  const [trialNumber, setTrialNumber] = useState(1);
  const messagesEndRef = useRef(null);

  const handleAppChange = (event) => {
    setSelectedApp(event.target.value);
  };

  const handleTrialChange = (event) => {
    setTrialNumber(event.target.value);
  };

  const handleSettingChange = (event) => {
    setTestSetting(event.target.value);
    const _ = setTimeout(() => {
      setMessages([]);
    });
  };

  const handleReset = () => {
    setMessages([]);
  };

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = { text: input, sender: "user" };
      setMessages([...messages, newMessage]);
      scrollToBottom();
      if (testSetting === "free-form-prompting") {
        axios
          .post("/serve/response/", {
            motivation_app: selectedApp,
            instruction: input,
            message: [],
            mode: "finetuned",
          })
          .then((response) => {
            console.log(response.data.data);
            const _ = setTimeout(() => {
              setMessages((prevMessages) => [
                ...prevMessages,
                {
                  text: response.data.data.response,
                  sender: "bot",
                },
              ]);
              scrollToBottom();
            }, 1000);
          })
          .catch((error) => {
            console.error("There was an error!", error);
          });
      } else if (testSetting === "original-preference-elicitation") {
        if (testState === "unfinished") {
          axios
            .post("/serve/question/", {
              motivation_app: selectedApp,
              instruction: input,
              message: messages,
              mode: "original",
            })
            .then((response) => {
              console.log(response.data.data);
              const _ = setTimeout(() => {
                setMessages((prevMessages) => [
                  ...prevMessages,
                  {
                    text: response.data.data.response,
                    sender: "bot",
                  },
                ]);
                let newEpochNumber = epochNumber + 1;
                setEpochNumber(newEpochNumber);
                if (newEpochNumber >= trialNumber) {
                  setTestState("finished");
                }
              }, 1000);
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          axios
            .post("/serve/response/", {
              motivation_app: selectedApp,
              instruction: input,
              message: messages,
              mode: "original",
            })
            .then((response) => {
              console.log(response.data.data);
              const _ = setTimeout(() => {
                setMessages((prevMessages) => [
                  ...prevMessages,
                  {
                    text: response.data.data.response,
                    sender: "bot",
                  },
                ]);
                setTestState("unfinished");
                setEpochNumber(0);
              }, 1000);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      } else if (testSetting === "finetuned-preference-elicitation") {
        if (testState === "unfinished") {
          axios
            .post("/serve/question/", {
              motivation_app: selectedApp,
              instruction: input,
              message: messages,
              mode: "finetuned",
            })
            .then((response) => {
              console.log(response.data.data);
              const _ = setTimeout(() => {
                setMessages((prevMessages) => [
                  ...prevMessages,
                  {
                    text: response.data.data.response,
                    sender: "bot",
                  },
                ]);
                let newEpochNumber = epochNumber + 1;
                setEpochNumber(newEpochNumber);
                if (newEpochNumber >= trialNumber) {
                  setTestState("finished");
                }
              }, 1000);
            })
            .catch((error) => {
              console.error("There was an error!", error);
            });
        } else {
          axios
            .post("/serve/response/", {
              motivation_app: selectedApp,
              instruction: input,
              message: messages,
              mode: "finetuned",
            })
            .then((response) => {
              console.log(response.data.data);
              const _ = setTimeout(() => {
                setMessages((prevMessages) => [
                  ...prevMessages,
                  {
                    text: response.data.data.response,
                    sender: "bot",
                  },
                ]);
                setTestState("unfinished");
                setEpochNumber(0);
              }, 1000);
            })
            .catch((error) => {
              console.error("There was an error!", error);
            });
        }
      }
      setInput("");
    }
  };

  return (
    <div
      style={{
        marginTop: "2em",
        marginBottom: "2em",
      }}
    >
      <div
        style={{ textAlign: "center", marginTop: "2em", marginBottom: "2em" }}
      >
        <h1>Preference Elicitation with Language Models</h1>
      </div>
      <div className="chatbot">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1em",
          }}
        >
          <select
            value={testSetting}
            onChange={handleSettingChange}
            style={{
              paddingTop: "0.5em",
              paddingBottom: "0.5em",
            }}
          >
            <option value="free-form-prompting">Free-Form Prompting</option>
            <option value="original-preference-elicitation">
              Preference Elicitation Ⅰ
            </option>
            <option value="finetuned-preference-elicitation">
              Preference Elicitation Ⅱ
            </option>
          </select>
          <select
            value={selectedApp}
            onChange={handleAppChange}
            style={{
              paddingTop: "0.5em",
              paddingBottom: "0.5em",
            }}
          >
            <option value="gmail">Gmail</option>
            <option value="grammarly">Grammarly</option>
            <option value="amazon">Amazon</option>
            <option value="google_translate">Google Translate</option>
            <option value="overleaf">Overleaf</option>
            <option value="ms_word">MS Word</option>
            <option value="ms_excel">MS Excel</option>
            <option value="ms_powerpoint">MS PowerPoint</option>
          </select>
          <select
            value={trialNumber}
            onChange={handleTrialChange}
            style={{
              paddingTop: "0.5em",
              paddingBottom: "0.5em",
            }}
          >
            <option value={1}>1</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
          <button
            onClick={handleReset}
            style={{ backgroundColor: "white", color: "gray" }}
          >
            Reset
          </button>
        </div>
        <div className="messages">
          {messages.map((msg, index) => (
            <Message key={index} text={msg.text} sender={msg.sender} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => (e.key === "Enter" ? handleSend() : null)}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
