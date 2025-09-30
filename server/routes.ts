import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";

interface Student {
  id: string;
  name: string;
}

interface Answer {
  studentId: string;
  studentName: string;
  answer: string;
}

interface Poll {
  question: string;
  options: string[];
  answers: Answer[];
  isActive: boolean;
  startTime?: number;
  correctAnswer?: string;
}

let currentPoll: Poll | null = null;
let students: Map<string, Student> = new Map();
let questionTimer: NodeJS.Timeout | null = null;

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("teacher:join", () => {
      socket.join("teachers");
      socket.emit("poll:current", currentPoll);
    });

    socket.on("student:join", (studentName: string) => {
      const student: Student = {
        id: socket.id,
        name: studentName
      };
      students.set(socket.id, student);
      socket.join("students");
      socket.emit("poll:current", currentPoll);
    });

    socket.on("teacher:create-poll", (data: { question: string; options: string[]; correctAnswer?: string }) => {
      const allStudentsAnswered = currentPoll 
        ? currentPoll.answers.length === students.size && students.size > 0
        : true;

      if (!currentPoll || !currentPoll.isActive || allStudentsAnswered) {
        if (questionTimer) {
          clearTimeout(questionTimer);
        }

        currentPoll = {
          question: data.question,
          options: data.options,
          answers: [],
          isActive: true,
          startTime: Date.now(),
          correctAnswer: data.correctAnswer
        };

        io.emit("poll:new", currentPoll);

        questionTimer = setTimeout(() => {
          if (currentPoll) {
            currentPoll.isActive = false;
            io.emit("poll:ended", currentPoll);
          }
        }, 60000);
      } else {
        socket.emit("error", { message: "Cannot create poll: Previous question not completed" });
      }
    });

    socket.on("student:submit-answer", (answer: string) => {
      const student = students.get(socket.id);
      if (!student || !currentPoll || !currentPoll.isActive) {
        return;
      }

      const hasAnswered = currentPoll.answers.some(a => a.studentId === socket.id);
      if (hasAnswered) {
        return;
      }

      currentPoll.answers.push({
        studentId: socket.id,
        studentName: student.name,
        answer: answer
      });

      io.to("teachers").emit("poll:answer", {
        studentName: student.name,
        answer: answer,
        totalAnswers: currentPoll.answers.length,
        totalStudents: students.size
      });

      socket.emit("answer:submitted", true);

      if (currentPoll.answers.length === students.size && students.size > 0) {
        if (questionTimer) {
          clearTimeout(questionTimer);
        }
        currentPoll.isActive = false;
        io.emit("poll:ended", currentPoll);
      }
    });

    socket.on("disconnect", () => {
      students.delete(socket.id);
      console.log("Client disconnected:", socket.id);
    });
  });

  return httpServer;
}
