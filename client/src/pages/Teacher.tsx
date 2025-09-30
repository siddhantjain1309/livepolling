import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Poll {
  question: string;
  options: string[];
  answers: Array<{ studentId: string; studentName: string; answer: string }>;
  isActive: boolean;
  startTime?: number;
}

export default function Teacher() {
  const socket = useSocket();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!socket) return;

    socket.emit("teacher:join");

    socket.on("poll:current", (poll: Poll) => {
      setCurrentPoll(poll);
    });

    socket.on("poll:new", (poll: Poll) => {
      setCurrentPoll(poll);
      setTimeLeft(60);
    });

    socket.on("poll:answer", () => {
      socket.emit("teacher:join");
    });

    socket.on("poll:ended", (poll: Poll) => {
      setCurrentPoll(poll);
    });

    socket.on("error", (err: { message: string }) => {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    });

    return () => {
      socket.off("poll:current");
      socket.off("poll:new");
      socket.off("poll:answer");
      socket.off("poll:ended");
      socket.off("error");
    };
  }, [socket]);

  useEffect(() => {
    if (currentPoll && currentPoll.isActive && currentPoll.startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentPoll.startTime!) / 1000);
        const remaining = Math.max(0, 60 - elapsed);
        setTimeLeft(remaining);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [currentPoll]);

  const handleCreatePoll = () => {
    if (!question.trim()) {
      setError("Please enter a question");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      setError("Please provide at least 2 options");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (socket) {
      socket.emit("teacher:create-poll", { question, options: validOptions });
      setQuestion("");
      setOptions(["", "", "", ""]);
    }
  };

  const getResults = () => {
    if (!currentPoll) return [];

    const results = currentPoll.options.map(option => {
      const count = currentPoll.answers.filter(a => a.answer === option).length;
      const percentage = currentPoll.answers.length > 0 
        ? (count / currentPoll.answers.length) * 100 
        : 0;
      return { option, count, percentage };
    });

    return results;
  };

  return (
    <div className="bg-white w-full min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <Badge className="flex w-[134px] h-[31px] items-center justify-center gap-[7px] px-[9px] py-0 rounded-3xl bg-[linear-gradient(90deg,rgba(117,101,217,1)_0%,rgba(77,10,205,1)_100%)] text-white [font-family:'Sora',Helvetica] font-semibold text-sm">
            <img
              className="relative w-[14.66px] h-[14.65px]"
              alt="Vector"
              src="/figmaAssets/vector.svg"
            />
            Intervue Poll
          </Badge>
        </div>

        <h1 className="text-4xl font-semibold text-center mb-2 [font-family:'Sora',Helvetica]">
          Teacher Dashboard
        </h1>
        <p className="text-center text-gray-500 mb-8 [font-family:'Sora',Helvetica]">
          Create polls and view live results
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 [font-family:'Sora',Helvetica]">Create Poll</h2>
            <div className="space-y-4">
              <Input
                placeholder="Enter your question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="[font-family:'Sora',Helvetica]"
              />
              {options.map((option, index) => (
                <Input
                  key={index}
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = e.target.value;
                    setOptions(newOptions);
                  }}
                  className="[font-family:'Sora',Helvetica]"
                />
              ))}
              <Button
                onClick={handleCreatePoll}
                className="w-full rounded-[34px] bg-[linear-gradient(159deg,rgba(143,100,225,1)_0%,rgba(29,104,189,1)_100%)] hover:bg-[linear-gradient(159deg,rgba(143,100,225,0.9)_0%,rgba(29,104,189,0.9)_100%)] text-white [font-family:'Sora',Helvetica] font-semibold"
              >
                Create Poll
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 [font-family:'Sora',Helvetica]">Live Results</h2>
            {currentPoll ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold [font-family:'Sora',Helvetica]">{currentPoll.question}</p>
                  {currentPoll.isActive && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm [font-family:'Sora',Helvetica]">Time left: {timeLeft}s</span>
                        <span className="text-sm [font-family:'Sora',Helvetica]">
                          Answers: {currentPoll.answers.length}
                        </span>
                      </div>
                      <Progress value={(timeLeft / 60) * 100} className="h-2" />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {getResults().map((result, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="[font-family:'Sora',Helvetica]">{result.option}</span>
                        <span className="[font-family:'Sora',Helvetica] text-sm text-gray-600">
                          {result.count} ({result.percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={result.percentage} className="h-2" />
                    </div>
                  ))}
                </div>

                {!currentPoll.isActive && (
                  <div className="text-center text-green-600 font-semibold [font-family:'Sora',Helvetica]">
                    Poll Ended
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center [font-family:'Sora',Helvetica]">
                No active poll. Create one to get started!
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
