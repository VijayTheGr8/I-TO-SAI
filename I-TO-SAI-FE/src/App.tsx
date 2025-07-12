import { useEffect, useState } from "react"
import { DailyReflectionCarousel } from "./components/DailyReflectionCarousel";
import { Button } from "./components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CumulativeGraph } from "@/components/CumulativeGraph"; // adjust path if needed
import { ChartColumnBig } from "lucide-react";
import { ATFSuggestionDialog } from "./components/ATFSuggestionDialog";
import { PastResponsesSection } from "./components/PastResponsesSection";
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


export interface ATFSuggestionDetail {
  reason: string;
  guidance: string;
}

export interface ATFSuggestions {
  [goal: string]: ATFSuggestionDetail[];
}

export interface User {
  username: string,
  email: string 
  responses: DayResponse[]
  ATFSuggestions: ATFSuggestions
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
  const [pastATFSuggestions, setPastATFSuggestions] = useState<ATFSuggestions | null>(null)
  const [top3MostFailed, setTop3MostFailed] = useState<FailStat[]>([]);
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
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
  }, [pastResponses]);

  useEffect(() => {
    getUserDetails();
  }, []);

  const submitDailyResponse = (answers: Answer[]) => {
    const reqBody: DayResponse = {
      dayIndex: dayNumber,
      answers
    };
    
    fetch(`${window.location.origin}/api/submitDailyResponse`, {
      method: "POST",
      credentials: "include",                 
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reqBody)
    })
    .then(async res => {
      const result = await res.text();
      if (result === "success") {
        setSubmittedToday(true);
        getUserDetails();
      }
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
  const getUserDetails = () => {
    fetch(`${window.location.origin}/api/getUserDetails`, {
      credentials: "include"
    })
      .then(res => {
        if (!res.ok) throw new Error("not logged in");
        return res.json() as Promise<User>;
      })
      .then((data)=>{
        console.log("setting user to:", data)
        setUser(data);
        const sortedPRData: DayResponse[] = sortPastResponses(data.responses)
        setPastResponses(sortedPRData);
        const todayResp = sortedPRData.find((dr) => dr.dayIndex === dayNumber);
        if (todayResp) {
          setSubmittedToday(true)
          const map: Record<number, boolean> = {};
          todayResp.answers.forEach((ans) => {
            map[ans.questionNumber] = ans.answer;
          });
          setCurrentDayAnswersMap(map);
        }
        setPastATFSuggestions(data.ATFSuggestions);
      })
      .catch(() => setUser(null));
  }

  const sortPastResponses = (data: DayResponse[]): DayResponse[] => {
    return data.sort((a, b) => a.dayIndex - b.dayIndex).map(dr => ({...dr,
        answers: dr.answers.sort((c, d) => c.questionNumber - d.questionNumber)
      }));
  }

  const startDate = new Date(2025, 6, 13); //month is 0 indexed, don't panic
  const today = new Date();
  const diffTime = today.getTime() - startDate.getTime();
  const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  console.log("today is", today, `\nday number ${dayNumber}`)


  const [currentDayAnswersMap, setCurrentDayAnswersMap] = useState<Record<number, boolean>>({});
  const [slideNum, setSlideNum] = useState<number>(0);
  const handleSelect = (index: number, value: boolean) => {
    setCurrentDayAnswersMap(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    const currentDayAnswersArr = Object.entries(currentDayAnswersMap).map(([qNum, ans]) => ({questionNumber: Number(qNum), answer: ans}));
    submitDailyResponse(currentDayAnswersArr);
  };

  const addATFSuggestion = (goal: string, detail: ATFSuggestionDetail) => {
    setPastATFSuggestions(prev => {
      const suggestions: ATFSuggestions = prev ?? {};
      const existing = suggestions[goal] ?? [];
      return {
        ...suggestions,
        [goal]: [...existing, detail],
      };
    });
  };


  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      <div className="absolute inset-0">
        <img
          src="/2.png"
          alt=""
          className="
            absolute inset-y-0
            h-full 
            [@media(max-width:1200px)]:-left-[35%]
            [@media(max-width:700px)]:-left-[90%]
            bg-[url('/2.png')]   
            bg-cover
            bg-left
            bg-no-repeat
            overflow-hidden
            max-w-none
            "         
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-orange-50 to-yellow-300 opacity-80" />
      <div className="relative z-10 flex flex-col flex-grow">
        <header className="grid grid-cols-4 items-center p-2 bg-gradient-to-br from-orange-50 via-orange-50 to-yellow-50 shadow-lg">
          <div className="flex items-center">
            <img 
              src="/logo2.png" 
              alt="York Logo" 
              className="h-30 w-auto object-contain" 
            />
          </div>
          <div className="flex items-center justify-center text-center">
            <img 
              src="/1.png" 
              alt="I to SAI Logo" 
              className="h-20 w-auto object-contain" 
            />
          </div>
          <div className="ml-4 flex flex-col items-start">
            <img 
              src="/logo.png" 
              alt="SAI100 Logo" 
              className="h-15 w-auto object-contain" 
            />
            {/* <p className="whitespace-nowrap inline-block -mt-1 -ml-12 text-bold text-sm font-semibold ">
              [Nine Point Code of Conduct]
            </p> */}
          </div>

          <nav className="flex justify-end space-x-2">
            {user ? (
              <a
                href={`${window.location.origin}/perform_logout`}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition shadow-md"
              >
                Logout
              </a>
            ) : (
              <div className="flex flex-col space-y-2 items-end">
                <a
                  href={`${window.location.origin}/register`}
                  className="text-center px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 transition shadow-md"
                >
                  Sign Up
                </a>
                <a
                  href={`${window.location.origin}/login`}
                  className="text-center px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition shadow-md"
                >
                  Login
                </a>
              </div>
            )}
          </nav>

        </header>

        <main className="flex-grow relative z-0">
          {/* {user && <section className="relative h-0">
            <div
              className="absolute ml-4 mt-5 text-sm text-gray-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-md shadow z-10 opacity-80"
            >
              <div>Today: {today.toDateString().slice(4).replace(' 2025', '')}</div>
              <div>Day: {dayNumber}</div>
            </div>
          </section>} */}
          {user ? (
            <div className="grid grid-cols-3 [@media(max-width:1425px)]:grid-cols-2 gap-8 relative z-0 w-full">
              <div id="past-responses" 
                className="
                  flex flex-col items-center w-full

                  [@media(max-width:700px)]:col-start-1
                  [@media(max-width:700px)]:col-span-2
                  [@media(max-width:700px)]:row-start-3
                  
                  [@media(min-width:1425px)]:mt-4 

                  [@media(max-width:1425px)]:mt-0                 
                  [@media(max-width:1425px)]:row-start-2
                  [@media(max-width:1425px)]:col-start-1
                  [@media(max-width:1425px)]:items-center
                  "
              >
                <PastResponsesSection pastResponses={pastResponses} />
              </div>


              <div id="daily-reflection-form" 
                className="
                  mt-5 h-90 min-w-60 w-full
                  row-start-1
                  col-start-2
                  col-span-1
                  justify-self-center
                  flex flex-col justify-center items-center
                  opacity-90

                  [@media(max-width:1425px)]:col-start-1
                  [@media(max-width:1425px)]:col-span-2
                  "
              >
                <div className="w-full [@media(min-width:1130px)]:min-w-163 max-w-163 bg-white shadow-lg rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 text-center my-3 font-sans">Sai Ram{user && `, ${user.username}`}</h2>
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
                    ) : Object.keys(currentDayAnswersMap).length === questions.length ? (
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
                          currentDayAnswersMap[slideNum] === true
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
                          currentDayAnswersMap[slideNum] === false
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

              <div 
                id="areas-to-focus"  
                className="
                flex flex-col items-center w-full mt-5 
                
                [@media(max-width:1725px)]:ml-15 
                
                [@media(max-width:1425px)]:row-start-2
                [@media(max-width:1425px)]:col-start-2
                [@media(max-width:1425px)]:items-center
                [@media(max-width:1425px)]:ml-0

                [@media(max-width:900px)]:items-start
                [@media(max-width:900px)]:ml-5 

                [@media(max-width:700px)]:col-start-1
                [@media(max-width:700px)]:col-span-2
                [@media(max-width:700px)]:ml-0
                [@media(max-width:700px)]:!items-center
                "
              > 
                {pastResponses.length > 0 && top3MostFailed.length > 0 && (
                  <section className="w-2/3 mr-20">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg min-w-75">
                      <div className="flex flex-row justify-between mb-3">
                      <h4 className="text-yellow-800 font-semibold">
                          Areas to focus on
                        </h4>
                        <Dialog open={graphOpen} onOpenChange={setGraphOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-yellow-400 hover:bg-yellow-800"><ChartColumnBig/></Button>
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
                      <ul className="list-none list-inside space-y-2 text-yellow-800">
                        {top3MostFailed.map((fs, idx) => (
                          <li key={idx}>
                            <button
                              onClick={() => setOpenDialogIndex(idx)}
                              className="
                                w-full text-left
                                flex justify-between items-center
                                px-4 py-2
                                rounded-lg
                                bg-yellow-50
                                hover:bg-yellow-100
                                active:bg-yellow-200
                                transition duration-200
                                border border-yellow-300
                                shadow-sm
                                cursor-pointer
                              "
                            >
                              <span className="text-sm">{fs.fail}</span>
                              <span className="font-semibold text-yellow-900">{fs.count}x</span>
                            </button>
                              {openDialogIndex === idx && (
                                <ATFSuggestionDialog
                                  pastSuggestions={pastATFSuggestions?.[fs.fail] || []}
                                  goal={fs.fail}
                                  open={true}
                                  onOpenChange={(open) => {
                                    if (!open) setOpenDialogIndex(null);
                                  }}
                                  updateATFResponses={addATFSuggestion}
                              />
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                  )}
                </div>
            </div>
          ): (
            <div className="mt-5 mb-20 flex justify-center items-center px-6 py-10">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Sathya Sai Baba’s Nine Point Code of Conduct</h2>
                <p className="text-gray-700 mb-4">
                  Bhagawan Sri Sathya Sai Baba proclaimed the Nine Point Code of Conduct as a guiding light for every devotee’s spiritual and personal development.
                </p>
                <blockquote className="italic text-gray-600 border-l-4 border-orange-400 pl-4 mb-4">
                  “It is the Code of Conduct which is responsible for the Organization moving forward, growing from strength to strength. The office bearers should exercise maximum care to see that the Code of Conduct is adhered to and guide others also in the right path… There should be no scramble for power or position. What matters is the purity, intensity of devotion and the spirit of self-sacrifice.”<br />
                  <span className="block mt-2 font-medium">~ Baba</span>
                </blockquote>
                {/* <p className="text-gray-700 mb-6">
                  At the First Overseas Convention of Chairpersons of Sai Centers in 1998, Baba emphasized the importance of understanding and living by these principles through study circles and daily reflection.
                </p> */}
                <p className="text-lg text-orange-400 font-semibold">
                  Please log in or sign up to access the 100-Day Daily Life Character & Conduct Reflection Tracker.
                </p>
              </div>
            </div>
          )}
        </main>
        <footer 
          className={`
            w-full
            py-6
            bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400
            text-white text-center shadow-xl
            ${(!user || pastResponses.length === 0)
              ? 'absolute bottom-0 left-0'
              : 'mt-5'}
          `}>
          <div className="flex flex-col font-extrabold items-center justify-center">
            <p className="text-sm">
              I to SAI © {new Date().getFullYear()}
            </p>
            <p>
              • Sri Sathya Sai Baba Centre of Toronto York •
            </p>
        </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
