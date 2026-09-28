import React from 'react';
import { Github, Twitter, Youtube, Flower } from 'lucide-react';
import { AnimatedDock } from "@/components/ui/animated-dock";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";

const Demo = () => {
    return (
        <div className="flex w-full py-8 justify-center items-center">
            <AnimatedDock
                items={[
                    {
                        link: "https://github.com/preetsuthar17",
                        target: "_blank",
                        Icon: <Github size={22} />,
                    },
                    {
                        link: "https://x.com/preetsuthar17",
                        target: "_blank",
                        Icon: <Twitter size={22} />,
                    },
                    {
                        link: "https://www.youtube.com/@preetsuthar17",
                        target: "_blank",
                        Icon: <Youtube size={22} />,
                    },
                    {
                        link: "https://github.com/preetsuthar17/hextaui",
                        target: "_blank",
                        Icon: <Flower size={22} />,
                    },
                ]}
            />
        </div>
    );
};

const DemoOne: React.FC = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center">
      <StaggerTestimonials />
    </div>
  );
};

export { Demo, DemoOne };
