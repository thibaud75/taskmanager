import React, { useState, useEffect, useContext } from "react";
import { useTimer } from "react-timer-hook";
import uuid from "react-uuid";
import { ThemeContext } from "./components/ThemeContext";
import "./App.css";

const App = () => {
  const [showInput, setShowInput] = useState("");
  const [task, setTask] = useState(() => {
    const localStorageData = localStorage.getItem("task");
    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      return parsedData;
    } else return [];
  });
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [numberChecked, setNumberChecked] = useState(0);
  const [currentlyDoing, setCurrentlyDoing] = useState(
    "Not currently doing anything"
  );
  const [checkDone, setCheckDone] = useState(true);

  // Darkmode
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  const time = new Date();
  time.setSeconds(time.getSeconds() + 12); // chiffre = timer en secondes

  const MyTimer = ({ expiryTimestamp }) => {
    const { seconds, minutes, isRunning, totalSeconds, start, restart } =
      useTimer({
        expiryTimestamp,
        autoStart: false,
      });
    const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    const [textTimer, setTextTimer] = useState("");

    useEffect(() => {
      setTextTimer(totalSeconds === 0 ? "Time is up!" : "");
      setCheckDone(
        currentlyDoing === "Not currently doing anything" ? true : false
      );
    }, [totalSeconds]);

    return (
      <div>
        <button
          onClick={() => {
            if (textTimer !== "Time is up!") {
              start();
              console.log("timer");
            } else {
              const restartTime = new Date();
              restart(
                restartTime.setSeconds(restartTime.getSeconds() + 10),
                true
              );
              console.log("restart");
            }
          }}
          disabled={checkDone}
        >
          Start 25 timer
        </button>
        <div>
          {isRunning ? (
            <span>
              {formattedMinutes}:{formattedSeconds}
            </span>
          ) : (
            <span>
              {formattedMinutes}:{formattedSeconds}
            </span>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    localStorage.setItem("task", JSON.stringify(task));

    let count = 0;
    task.forEach((element) => {
      if (element.checked === true) count++;
    });
    setNumberChecked(count);
  }, [task]);

  // FONCTION DE SUBMIT DE LA TACHE
  const handleSubmit = (e) => {
    e.preventDefault();

    const saveInput = [...task];
    saveInput.push({
      id: uuid(),
      text: showInput,
      checked: false,
    });

    setTask(saveInput);
    console.log(saveInput);
    setShowInput("");
  };

  // FONCTION POUR SUPPRIMER UNE TACHE
  const handleDelete = (taskId) => {
    const updatedTasks = task.filter((elem) => elem.id !== taskId);
    setTask(updatedTasks);

    const currentTask = task.find(
      (elem) => elem.text === currentlyDoing && elem.id === taskId
    );

    setCurrentlyDoing(
      currentTask ? "Not currently doing anything" : currentlyDoing
    );
  };

  // FONCTION POUR COCHER OU DECOCHER UNE TACHE + CHANGE LE CHEKDONE SI BESOIN
  const checkTickedInput = (taskId) => {
    const currentTask = task.find(
      (elem) => elem.id === taskId && elem.text === currentlyDoing
    );
    console.log(currentTask);
    if (currentTask && currentTask.text === currentlyDoing) {
      setCheckDone(true);
      setCurrentlyDoing("Not currently doing anything");
    }
    setTask((prevTask) =>
      prevTask.map((elem) =>
        elem.id === taskId ? { ...elem, checked: !elem.checked } : elem
      )
    );
  };

  // FONCTION DE CHECK DU STATUS DE NOMBRE DE CASE COCHE
  const howManyChecked = () => {
    let widthPercentage = (numberChecked / task.length) * 100;
    return widthPercentage;
  };

  // FONCTION DO NOW
  const displayCurrentTask = (elem) => {
    console.log(elem);
    setCurrentlyDoing(elem.text);
    setCurrentTaskId(elem.id);
    setCheckDone(elem.checked);
  };

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("isDarkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <>
      <div className="all">
        <div className="left">
          <div className="divProgress">
            <p>Progress:</p>
            <div className="progressbar">
              {task.length > 0 && (
                <div
                  style={{
                    backgroundColor: "red",
                    width: howManyChecked() + "%",
                  }}
                ></div>
              )}
            </div>
          </div>
          <button className="buttondarkmode" onClick={toggleDarkMode}>
            {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
          <h2>My tasks</h2>
          <ul>
            {task.map((elem) => (
              <li key={elem.id}>
                <input
                  type="checkbox"
                  checked={elem.checked}
                  onChange={() => checkTickedInput(elem.id)}
                />
                {elem.text}
                <button
                  className={`donow ${
                    !elem.checked ? "doingTask" : "notDoingTask"
                  }`}
                  onClick={() => displayCurrentTask(elem)}
                >
                  do now
                </button>
                <button onClick={() => handleDelete(elem.id)}>X</button>
              </li>
            ))}
          </ul>
          <h2>New task:</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={showInput}
              onChange={(e) => setShowInput(e.target.value)}
            />
            <button type="submit">Add Task</button>
          </form>
        </div>
        <div className="right">
          <h2>Currently doing</h2>
          <p>{currentlyDoing}</p>
          <div className="tasktimer">
            <button
              disabled={checkDone}
              onClick={() => checkTickedInput(currentTaskId)}
            >
              I am done
            </button>
            <MyTimer expiryTimestamp={time} />
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
