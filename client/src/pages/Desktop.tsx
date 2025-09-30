import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Desktop = (): JSX.Element => {
  const [selectedRole, setSelectedRole] = useState<string>("student");

  const roleOptions = [
    {
      id: "student",
      title: "I'm a Student",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
    },
    {
      id: "teacher",
      title: "I'm a Teacher",
      description: "Submit answers and view live poll results in real-time.",
    },
  ];

  return (
    <div className="bg-white w-full min-w-[1440px] min-h-[923px] relative">
      <div className="flex flex-col w-[981px] items-center gap-[69px] absolute top-[252px] left-[243px]">
        <div className="inline-flex flex-col items-center gap-[26px] relative flex-[0_0_auto]">
          <div className="flex flex-col w-[737px] items-center gap-[5px] relative flex-[0_0_auto]">
            <div className="relative self-stretch mt-[-1.00px] [font-family:'Sora',Helvetica] font-normal text-black text-[40px] text-center tracking-[0] leading-[normal]">
              <span className="[font-family:'Sora',Helvetica] font-normal text-black text-[40px] tracking-[0]">
                Welcome to the{" "}
              </span>
              <span className="font-semibold">Live Polling System</span>
            </div>
            <div className="relative self-stretch [font-family:'Sora',Helvetica] font-normal text-[#00000080] text-[19px] text-center tracking-[0] leading-[normal]">
              Please select the role that best describes you to begin using the
              live polling system
            </div>
          </div>
        </div>
      </div>

      <Button className="absolute top-[598px] left-[633px] w-[234px] h-[58px] rounded-[34px] bg-[linear-gradient(159deg,rgba(143,100,225,1)_0%,rgba(29,104,189,1)_100%)] hover:bg-[linear-gradient(159deg,rgba(143,100,225,0.9)_0%,rgba(29,104,189,0.9)_100%)] text-white text-lg [font-family:'Sora',Helvetica] font-semibold px-[70px] py-[17px] h-auto">
        Continue
      </Button>

      <Badge className="flex w-[134px] h-[31px] items-center justify-center gap-[7px] px-[9px] py-0 absolute top-[195px] left-[656px] rounded-3xl bg-[linear-gradient(90deg,rgba(117,101,217,1)_0%,rgba(77,10,205,1)_100%)] hover:bg-[linear-gradient(90deg,rgba(117,101,217,0.9)_0%,rgba(77,10,205,0.9)_100%)] text-white [font-family:'Sora',Helvetica] font-semibold text-sm">
        <img
          className="relative w-[14.66px] h-[14.65px]"
          alt="Vector"
          src="/figmaAssets/vector.svg"
        />
        Intervue Poll
      </Badge>

      <div className="flex gap-[32px] absolute top-[405px] left-[346px]">
        {roleOptions.map((role) => (
          <Card
            key={role.id}
            className={`flex flex-col w-[387px] h-[143px] items-start justify-center gap-[17px] pl-[25px] pr-[17px] py-[15px] rounded-[10px] overflow-hidden cursor-pointer transition-all ${
              selectedRole === role.id
                ? "border-[none] before:content-[''] before:absolute before:inset-0 before:p-[3px] before:rounded-[10px] before:[background:linear-gradient(150deg,rgba(119,101,218,1)_0%,rgba(29,104,189,1)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
                : "border border-solid border-[#d9d9d9] hover:border-[#b0b0b0]"
            }`}
            onClick={() => setSelectedRole(role.id)}
          >
            <CardContent className="p-0">
              <div className="inline-flex flex-col items-start justify-center gap-[9px] relative flex-[0_0_auto]">
                <div className="inline-flex items-end justify-center gap-[11px] relative flex-[0_0_auto]">
                  <div className="relative w-fit mt-[-1.00px] [font-family:'Sora',Helvetica] font-semibold text-black text-[23px] tracking-[0] leading-[normal] whitespace-nowrap">
                    {role.title}
                  </div>
                </div>
              </div>
              <div
                className={`relative ${role.id === "student" ? "w-[385px] mr-[-40.00px]" : "w-[326px]"} h-11 [font-family:'Sora',Helvetica] font-normal text-[#454545] text-base tracking-[0] leading-[normal]`}
              >
                {role.description}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
