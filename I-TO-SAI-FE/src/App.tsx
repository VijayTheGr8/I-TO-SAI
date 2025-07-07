import { useEffect, useState } from "react"
import { PastResponse } from "./components/PastResponse";
import { Accordion } from "@radix-ui/react-accordion";
import { DailyReflectionCarousel } from "./components/DailyReflectionCarousel";

export const questions = [
  "Did I take a few moments today for quiet reflection, prayer, or mindfulness?",
  "Did I engage in or encourage any form of spiritual practice or uplifting activity with my family?",
  "Have I supported the spiritual or moral development of children in my home (e.g., shared a story, guided behavior, or encouraged good values)?",
  "Did I take part in or support any service activity—big or small—today (e.g., helping someone, donating, or volunteering)?",
  "Have I stayed connected with my spiritual or community group by attending a session, even virtually, today?",
  "Did I read, watch, or listen to something today that helped me grow spiritually or morally?",
  "Did I make a conscious effort to speak gently and lovingly, even when stressed or frustrated?",
  "Did I avoid gossiping or judging others—especially when they weren’t present?",
  "Did I consciously avoid wasting time, money, food, or energy—and redirect it toward something helpful or meaningful?"
];

export const statements = [
  "take a few moments for quiet reflection, prayer, or mindfulness",
  "engage in or encourage any form of spiritual practice or uplifting activity with my family",
  "support the spiritual or moral development of children in my home (e.g., share a story, guide behavior, or encourage good values)",
  "take part in or support any service activity—big or small—today (e.g., help someone, donate, or volunteer)",
  "stay connected with my spiritual or community group by attending a session, even virtually",
  "read, watch, or listen to something that helped me grow spiritually or morally",
  "make a conscious effort to speak gently and lovingly, even when stressed or frustrated",
  "avoid gossiping or judging others—especially when they weren’t present",
  "consciously avoid wasting time, money, food, or energy—and redirect it toward something helpful or meaningful"
];


interface User {
  username: string,
  email: string 
  pastResponses: DayResponse[]
}

export interface Answer {
  questionNumber: number;
  answer: boolean;
}

export interface DayResponse {
  dayIndex: number;
  answers: Answer[];
}

type FailStat = { fail: string; count: number };

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [pastResponses, setPastResponses] = useState<DayResponse[]>([]);
  const [top3MostFailed, setTop3MostFailed] = useState<FailStat[]>([]);

  useEffect(() => {
    const countMap: Record<number, number> = {};
    pastResponses.forEach((dr) =>
      dr.answers.forEach((ans) => {
        if (!ans.answer) countMap[ans.questionNumber] = (countMap[ans.questionNumber] ?? 0) + 1;
      })
    );

    const newTop3 = Object.entries(countMap)
      .map(([q, c]) => [Number(q), c] as [number, number])
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([q, c]) => ({ fail: statements[q], count: c }));

    setTop3MostFailed(newTop3);
    if (submittedToday) {
      answersMap
    }
  }, [pastResponses]);

  useEffect(() => {
    getUserDetails();
    getAllUserDailyResponses();
  }, []);

  const submitDailyResponse = (answers: Answer[]) => {
    const reqBody: DayResponse = {
      dayIndex: dayNumber,
      answers
    };
    
    fetch("http://localhost:8080/submitDailyResponse", {
      method: "POST",
      credentials: "include",                 // send the JSESSIONID cookie
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reqBody)
    })
    .then(async res => {
      const result = await res.text();
      console.log(result) 
      if (result === "success") {
        setSubmittedToday(true);
        getAllUserDailyResponses();
      } //trigger a rerender
      else if (result === "fail:resubmit") {
        alert("Failed to submit; You already submitted for today!")
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error saving your responses.");
    });
  }

  const [submittedToday, setSubmittedToday] = useState(false);
  const getAllUserDailyResponses = () => {
    fetch("http://localhost:8080/viewResponsesForUser", {
      credentials: "include"
    })
    .then(res => {
      if (!res.ok) throw new Error("Submit failed");
      return res.json() as Promise<DayResponse[]>;
    })
    .then((data)=> {
      const sortedData = data
        .sort((a, b) => a.dayIndex - b.dayIndex)
        .map(dr => ({
          ...dr,
          answers: dr.answers.sort((c, d) => c.questionNumber - d.questionNumber)
        }));
      setPastResponses(sortedData);
      const todayResp = sortedData.find((dr) => dr.dayIndex === dayNumber);
      if (todayResp) {
        setSubmittedToday(true)
        const map: Record<number, boolean> = {};
        todayResp.answers.forEach((ans) => {
          map[ans.questionNumber] = ans.answer;
        });
        setAnswersMap(map);
        console.log(map)
      }
    })
    .catch(err => {
      console.log(err)
    })
  }

  const getUserDetails = () => {
    fetch("http://localhost:8080/getUserDetails", {
      credentials: "include"
    })
      .then(res => {
        if (!res.ok) throw new Error("not logged in");
        return res.json() as Promise<User>;
      })
      .then(setUser)
      .catch(() => setUser(null));
  }

  const startDate = new Date(2025, 6, 13); //month is 0 indexed, don't panic
  const today = new Date(2025, 6, 19);
  const diffTime = today.getTime() - startDate.getTime();
  const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;


  const [answersMap, setAnswersMap] = useState<Record<number, boolean>>({});
  const [slideNum, setSlideNum] = useState<number>(0);
  const handleSelect = (index: number, value: boolean) => {
    setAnswersMap(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    const answerArr = Object.entries(answersMap).map(([qNum, ans]) => ({questionNumber: Number(qNum), answer: ans}));
    submitDailyResponse(answerArr);
  };
  return (
    <div className="min-h-screen bg-gray-50 font-serif min-w-80">
      <header className="grid grid-cols-3 items-center p-4 bg-white shadow">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 ml-5">I to SAI</h1>
        </div>
        <div className="text-center">
          {user && (
            <span className="text-xl font-semibold text-gray-700">Sai Ram, {user.username}</span>
          )}
        </div>
        <nav className="flex justify-end space-x-2">
          {user ? (
            <a
              href="http://localhost:8080/perform_logout"
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition font-sans"
            >Logout</a>
          ) : (
            <>
              <a
                href="http://localhost:8080/login"
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >Login</a>
              <a
                href="http://localhost:8080/register"
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >Sign Up</a>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="px-4 py-2">
          <div className="flex flex-col items-end justify-end text-gray-600 text-sm">
            <div className="flex justify-end space-x-6 text-gray-600 text-sm">
              <div>Start: {startDate.toDateString().slice(4).replace(' 2025', '')}</div>
            </div>
            <div>Today: {today.toDateString().slice(4).replace(' 2025', '')}</div>
            <div>Day: {dayNumber}</div>
          </div>
          
        </section>
        {user ? (
          <div className="mt-6 grid grid-cols-3 gap-8">
            <div className="hidden" />
            <div className="
              row-start-1
              col-start-1
              col-span-3
              justify-self-center

              [@media(min-width:1000px)]:col-start-1
              [@media(min-width:1000px)]:col-span-2
              [@media(min-width:1000px)]:items-end
              [@media(min-width:1000px)]:ml-25

              [@media(min-width:1600px)]:col-start-1
              [@media(min-width:1600px)]:col-span-2
              [@media(min-width:1600px)]:items-end
              [@media(min-width:1600px)]:ml-25


              h-90 min-w-60 w-full
              flex flex-col justify-center items-center
            ">
            {/* //className="col-span-3 h-90 min-w-60 [@media(min-width:1200px)]:col-span-1 flex justify-center"> */}
              <div className="w-full max-w-163 bg-white shadow-lg rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 text-center my-3 font-serif">Daily Reflection</h2>
                <DailyReflectionCarousel 
                  onSlideChange={setSlideNum} />
                <div className="w-full flex items-center justify-between mt-4">
                  <div className="pl-2">
                    <span className="text-gray-500">{slideNum + 1}/9</span>
                  </div>
                  {submittedToday ? (
                    <button
                      disabled
                      className="
                        px-6 py-3
                        bg-gray-300 text-gray-600
                        rounded-full
                        cursor-not-allowed
                      "
                    >
                      Submitted
                    </button>
                  ) : Object.keys(answersMap).length === questions.length ? (
                    <button
                      onClick={handleSubmit}
                      className="
                        px-6 py-3
                        bg-gradient-to-r from-blue-500 to-indigo-600
                        hover:from-blue-600 hover:to-indigo-700
                        text-white font-semibold
                        rounded-full
                        shadow-lg
                        transform hover:-translate-y-0.5
                        transition
                        focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
                      "
                    >
                      Submit
                    </button>
                  ) : (
                    <div />
                  )}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => !submittedToday && handleSelect(slideNum, true)}
                      className={`px-4 py-1 rounded-full border transition ${
                        submittedToday?"cursor-not-allowed":''} ${
                        answersMap[slideNum] === true
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-green-100"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => !submittedToday && handleSelect(slideNum, false)}
                      className={`px-4 py-1 rounded-full border transition ${
                        submittedToday?"cursor-not-allowed":''} ${
                        answersMap[slideNum] === false
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-red-100"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="
              flex flex-row justify-evenly items-center
              space-y-0
              col-span-3
              col-start-1

              [@media(min-width:1000px)]:col-span-1
              [@media(min-width:1000px)]:col-start-3
              [@media(min-width:1000px)]:flex-col
              [@media(min-width:1000px)]:space-y-14
              [@media(min-width:1000px)]:justify-start
            ">
              {/* at 684w shift areas to focus on to next row*/}
            <div
              id="past-responses"className="
                row-start-2 col-start-1 col-span-1 
                [@media(min-width:1000px)]:row-start-1
                [@media(min-width:1000px)]:col-start-3
                [@media(min-width:1000px)]:items-end
                [@media(min-width:1600px)]:mr-0

                flex flex-col items-center w-full
              "
            >
            {/* <div id="past-responses" className="flex flex-col items-end col-start-3 row-start-1 w-full"> */}
              <div className="w-1/2 mr-20">
                {pastResponses.length === 0 ? (
                    <p className="text-gray-500">No previous entries</p>
                ) : (
                    <>
                      <h3 className="text-lg self-start font-semibold text-gray-700">Past Responses</h3>
                      <Accordion
                        type="single"
                        collapsible
                        className="w-full max-w-md min-w-55 [@media(min-width:1200px)]:mx-auto my-2 bg-white border border-gray-200 rounded-xl shadow font-sans"
                      >
                        {pastResponses.map((dr) => (
                            <PastResponse key={dr.dayIndex} dayResponse={dr}/>
                        ))}  
                      </Accordion>
                    </>
                    )}
              </div>
            </div>
            <div 
              id="areas-to-focus" 
              // className="flex flex-col col-start-3 row-start-2 w-1/2"
              className="
                row-start-2 col-span-1 col-start-2
                flex flex-col w-full
                [@media(min-width:1000px)]:col-start-3 
                [@media(min-width:1000px)]:items-end
              "
            > 
              {pastResponses.length > 0 && top3MostFailed.length > 0 && (
                <section className="w-2/3 mr-20">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg min-w-75">
                    <h4 className="text-yellow-800 font-semibold mb-2">
                      Areas to focus on
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-yellow-800">
                      {top3MostFailed.map((fs, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{fs.fail}</span>
                          <span className="font-semibold">{fs.count}x</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
                )}
            </div>
            </div>
          </div>
        ): (
          <p className="text-center text-gray-600">
            Please log in or sign up to access 100 Day Daily Life Character & Conduct Reflection tracker
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
