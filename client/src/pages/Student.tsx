import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Poll {
  question: string;
  options: string[];
  answers: Array<{ studentId: string; studentName: string; answer: string }>;
  isActive: boolean;
  startTime?: number;
  correctAnswer?: string;
}

export default function Student() {
  const socket = useSocket();
  const [studentName, setStudentName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const storedName = sessionStorage.getItem("studentName");
    if (storedName) {
      setStudentName(storedName);
      setHasJoined(true);
      if (socket) {
        socket.emit("student:join", storedName);
      }
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("poll:current", (poll: Poll) => {
      setCurrentPoll(poll);
      setHasAnswered(false);
      setSelectedAnswer("");
    });

    socket.on("poll:new", (poll: Poll) => {
      setCurrentPoll(poll);
      setHasAnswered(false);
      setSelectedAnswer("");
      setTimeLeft(60);
    });

    socket.on("answer:submitted", () => {
      setHasAnswered(true);
    });

    socket.on("poll:ended", (poll: Poll) => {
      setCurrentPoll(poll);
    });

    return () => {
      socket.off("poll:current");
      socket.off("poll:new");
      socket.off("answer:submitted");
      socket.off("poll:ended");
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

  const handleJoin = () => {
    if (studentName.trim()) {
      sessionStorage.setItem("studentName", studentName.trim());
      setHasJoined(true);
      if (socket) {
        socket.emit("student:join", studentName.trim());
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer && socket) {
      socket.emit("student:submit-answer", selectedAnswer);
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

  if (!hasJoined) {
    return (
      <div className="bg-white w-full min-h-screen flex items-center justify-center">
        <Card className="w-[500px] p-8">
          <div className="flex justify-center mb-6">
            <Badge className="flex w-[134px] h-[31px] items-center justify-center gap-[7px] px-[9px] py-0 rounded-3xl bg-[linear-gradient(90deg,rgba(117,101,217,1)_0%,rgba(77,10,205,1)_100%)] text-white [font-family:'Sora',Helvetica] font-semibold text-sm">
              <img
                className="relative w-[14.66px] h-[14.65px]"
                alt="Vector"
                src="/figmaAssets/vector.svg"
              />
              Intervue Poll
            </Badge>
          </div>
          <h2 className="text-3xl font-semibold text-center mb-2 [font-family:'Sora',Helvetica]">
            Welcome Student!
          </h2>
          <p className="text-center text-gray-500 mb-6 [font-family:'Sora',Helvetica]">
            Please enter your name to join
          </p>
          <Input
            placeholder="Enter your name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            className="mb-4 [font-family:'Sora',Helvetica]"
          />
          <Button
            onClick={handleJoin}
            className="w-full rounded-[34px] bg-[linear-gradient(159deg,rgba(143,100,225,1)_0%,rgba(29,104,189,1)_100%)] hover:bg-[linear-gradient(159deg,rgba(143,100,225,0.9)_0%,rgba(29,104,189,0.9)_100%)] text-white [font-family:'Sora',Helvetica] font-semibold"
          >
            Join
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-white w-full min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
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
          Hello, {studentName}!
        </h1>
        <p className="text-center text-gray-500 mb-8 [font-family:'Sora',Helvetica]">
          Answer the poll and view live results
        </p>

        {currentPoll ? (
          <Card className="p-8">
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 [font-family:'Sora',Helvetica]">
                  {currentPoll.question}
                </h2>
                {currentPoll.isActive && !hasAnswered && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold [font-family:'Sora',Helvetica]">
                        Time left: {timeLeft}s
                      </span>
                    </div>
                    <Progress value={(timeLeft / 60) * 100} className="h-2" />
                  </div>
                )}
              </div>

              {currentPoll.isActive && !hasAnswered ? (
                <div className="space-y-4">
                  <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                    {currentPoll.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer [font-family:'Sora',Helvetica]">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className="w-full rounded-[34px] bg-[linear-gradient(159deg,rgba(143,100,225,1)_0%,rgba(29,104,189,1)_100%)] hover:bg-[linear-gradient(159deg,rgba(143,100,225,0.9)_0%,rgba(29,104,189,0.9)_100%)] text-white [font-family:'Sora',Helvetica] font-semibold"
                  >
                    Submit Answer
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {hasAnswered && currentPoll.isActive && (
                    <div className="text-center text-green-600 font-semibold mb-4 [font-family:'Sora',Helvetica]">
                      Answer submitted! Waiting for results...
                    </div>
                  )}
                  
                  {!currentPoll.isActive && (
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold [font-family:'Sora',Helvetica]">Results</h3>
                      {getResults().map((result, index) => {
                        const isCorrect = currentPoll.correctAnswer === result.option;
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="[font-family:'Sora',Helvetica]">{result.option}</span>
                                {isCorrect && (
                                  <span className="text-green-600 text-sm font-semibold">✓ Correct</span>
                                )}
                              </div>
                              <span className="[font-family:'Sora',Helvetica] text-sm text-gray-600">
                                {result.count} ({result.percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <Progress value={result.percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <p className="text-gray-500 text-center [font-family:'Sora',Helvetica]">
              Waiting for the teacher to create a poll...
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
