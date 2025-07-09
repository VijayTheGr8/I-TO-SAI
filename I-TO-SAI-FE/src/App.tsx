import { useEffect, useState } from "react"
import { PastResponse } from "./components/PastResponse";
import { Accordion } from "@radix-ui/react-accordion";
import { DailyReflectionCarousel } from "./components/DailyReflectionCarousel";
import { Button } from "./components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { CumulativeGraph } from "@/components/CumulativeGraph"; // adjust path if needed
import { ChartColumnBig } from "lucide-react";
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
  const [graphOpen, setGraphOpen] = useState(false);

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
      <header className="grid grid-cols-3 items-center p-2 bg-white shadow">
        <div className="ml-4 flex flex-col items-start">
          <img 
            src="/logo.jpeg" 
            alt="I to SAI Logo" 
            className="ml-5 h-15 w-auto object-contain" 
          />
          <p className="inline-block text-bold text-sm font-semibold tracking-wide">
            [9pt Code of Conduct]
          </p>

        </div>

        <div className="text-center">
          <span className="text-xl font-semibold text-gray-700">Sai Ram{user && `, ${user.username}`}</span>
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
                className="text-center self-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >Login</a>
              <a
                href="http://localhost:8080/register"
                className="text-center self-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >Sign Up</a>
            </>
          )}
        </nav>
      </header>

      <main className="relative z-0">
        <div
          className="
              -z-10 absolute top-0 left-0 w-screen h-screen
              bg-[url('/0.jpg')] bg-cover bg-center bg-no-repeat
              opacity-70"
        ></div>
        <section className="relative h-0">
          <div
            className="absolute ml-4 mt-5 text-sm text-gray-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-md shadow z-10"
          >
            <div className="font-medium">Start: {startDate.toDateString().slice(4).replace(' 2025', '')}</div>
            <div>Today: {today.toDateString().slice(4).replace(' 2025', '')}</div>
            <div>Day: {dayNumber}</div>
          </div>
        </section>
        {user ? (
          <div className="grid grid-cols-3 gap-8 relative z-0 w-full">
            <div className="hidden" />
            <div className="mt-5
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
              mt-5 w-full

              flex flex-row space-y-6 space-x-25 mr-30

              [@media(min-width:1000px)]:grid
              [@media(min-width:1000px)]:grid-cols-1
              [@media(min-width:1000px)]:grid-rows-2
              [@media(min-width:1000px)]:space-y-0
              [@media(min-width:1000px)]:gap-y-10
            ">
            <div
              id="past-responses" className="flex flex-col items-end w-full"
            >
            {/* <div id="past-responses" className="flex flex-col items-end col-start-3 row-start-1 w-full"> */}
              <div className="w-1/2 mr-20">
                {pastResponses.length === 0 ? (
                    <p className="text-black text-center bg-white border border-gray-200 rounded-xl shadow font-sans">No previous entries</p>
                ) : (
                    <>
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
              className="flex flex-col items-end w-full"
            > 
              {pastResponses.length > 0 && top3MostFailed.length > 0 && (
                <section className="w-2/3 mr-20">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg min-w-75">
                    <div className="flex flex-row justify-between">
                    <h4 className="text-yellow-800 font-semibold mb-2">
                        Areas to focus on
                      </h4>
                      <Dialog open={graphOpen} onOpenChange={setGraphOpen}>
                        <DialogTrigger asChild>
                          <Button className=""><ChartColumnBig /></Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Graph of your responses</DialogTitle>
                            <DialogDescription>
                              Cumulative summary of questions missed
                            </DialogDescription>
                          </DialogHeader>
                          <CumulativeGraph pastResponses={pastResponses} />
                        </DialogContent>
                      </Dialog>

                    </div>
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
          <div className="flex justify-center items-center px-6 py-10">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Sathya Sai Baba’s Nine Point Code of Conduct</h2>
              <p className="text-gray-700 mb-4">
                Bhagawan Sri Sathya Sai Baba proclaimed the Nine Point Code of Conduct as a guiding light for every devotee’s spiritual and personal development.
              </p>
              <blockquote className="italic text-gray-600 border-l-4 border-blue-400 pl-4 mb-4">
                “It is the Code of Conduct which is responsible for the Organization moving forward, growing from strength to strength. The office bearers should exercise maximum care to see that the Code of Conduct is adhered to and guide others also in the right path… There should be no scramble for power or position. What matters is the purity, intensity of devotion and the spirit of self-sacrifice.”<br />
                <span className="block mt-2 font-medium">~ Baba</span>
              </blockquote>
              <p className="text-gray-700 mb-6">
                At the First Overseas Convention of Chairpersons of Sai Centers in 1998, Baba emphasized the importance of understanding and living by these principles through study circles and daily reflection.
              </p>
              <p className="text-lg text-indigo-600 font-semibold">
                Please log in or sign up to access the 100-Day Daily Life Character & Conduct Reflection Tracker.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
