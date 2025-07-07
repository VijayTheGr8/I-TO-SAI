import React, { useState } from 'react';
import { questions, type Answer } from '../App';

interface DailyReflectionFormProps {
  submitDailyResponse: (answers: Answer[]) => void;
}
export const DailyReflectionForm: React.FC<DailyReflectionFormProps> = ({submitDailyResponse}) => {
  const [answersMap, setAnswersMap] = useState<Record<number, boolean>>({});

  const handleSelect = (index: number, value: boolean) => {
    setAnswersMap(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const answerArr = Object.entries(answersMap).map(([qNum, ans]) => ({questionNumber: Number(qNum), answer: ans}))
    submitDailyResponse(answerArr);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-gray-800 text-center">Daily Life Reflection</h2>

      {questions.map((q, idx) => (
        <div key={idx} className="space-y-2">
          <p className="text-gray-700 font-medium">{`${idx + 1}. ${q}`}</p>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleSelect(idx, true)}
              className={`px-4 py-1 rounded-full border transition ${answersMap[idx] == true
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-green-100'}`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleSelect(idx, false)}
              className={`px-4 py-1 rounded-full border transition ${answersMap[idx] == false
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-red-100'}`}
            >
              No
            </button>
          </div>
        </div>
      ))}

      <div className="text-center">
        <button
          type="submit"
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </div>
    </form>
  );
}