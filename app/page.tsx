"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */
import * as fal from "@fal-ai/serverless-client";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { ModelIcon } from "@/components/icons/model-icon";
import Link from "next/link";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
const DEFAULT_PROMPT =
  "A cinematic shot of a baby raccoon wearing an intricate italian priest robe";

function randomSeed() {
  return Math.floor(Math.random() * 10000000).toFixed(0);
}

fal.config({
  proxyUrl: "/api/proxy",
});

const INPUT_DEFAULTS = {
  _force_msgpack: new Uint8Array([]),
  enable_safety_checker: true,
  image_size: "square_hd",
  sync_mode: true,
  num_images: 1,
  num_inference_steps: "2",
};

export default function Lightning() {
  const [image, setImage] = useState<null | string>(null);
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [seed, setSeed] = useState<string>(randomSeed());
  const [inferenceTime, setInferenceTime] = useState<number>(NaN);

  const connection = fal.realtime.connect("fal-ai/fast-lightning-sdxl", {
    connectionKey: "lightning-sdxl",
    throttleInterval: 64,
    onResult: (result) => {
      const blob = new Blob([result.images[0].content], { type: "image/jpeg" });
      setImage(URL.createObjectURL(blob));
      setInferenceTime(result.timings.inference);
    },
  });

  const timer = useRef<any | undefined>(undefined);

  const handleOnChange = async (prompt: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setPrompt(prompt);
    const input = {
      ...INPUT_DEFAULTS,
      prompt: prompt,
      seed: seed ? Number(seed) : Number(randomSeed()),
    };
    connection.send(input);
    timer.current = setTimeout(() => {
      connection.send({ ...input, num_inference_steps: "4" });
    }, 500);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.document.cookie = "fal-app=true; path=/; samesite=strict; secure;";
    }
    // initial image
    connection.send({
      ...INPUT_DEFAULTS,
      num_inference_steps: "4",
      prompt: prompt,
      seed: seed ? Number(seed) : Number(randomSeed()),
    });
  }, []);

  return (
    <main>
      <div className="flex flex-col justify-between h-[calc(100vh-56px)]">
        <div className="py-4 md:py-10 px-0 space-y-4 lg:space-y-8 mx-auto w-full max-w-xl">
          <div className="container px-3 md:px-0 flex flex-col space-y-2">
            <div className="flex flex-col max-md:space-y-4 md:flex-row md:space-x-4 max-w-full">
              <div className="flex-1 space-y-1">
                <strong>
                  <label>Prompt</label>
                </strong>
                <Input
                  onChange={(e) => {
                    handleOnChange(e.target.value);
                  }}
                  className="font-light w-full"
                  placeholder="Type something..."
                  value={prompt}
                />
              </div>
              <div className="space-y-1">
                <strong>
                  {" "}
                  <label>Power</label>
                </strong>
                <Input
                  onChange={(e) => {
                    setSeed(e.target.value);
                    handleOnChange(prompt);
                  }}
                  className="font-light w-28"
                  placeholder="random"
                  type="number"
                  value={seed}
                />
              </div>
            </div>
          </div>
          <div className="container flex flex-col space-y-6 lg:flex-row lg:space-y-0 p-3 md:p-0">
            <div className="flex-1 flex-col flex items-center justify-center">
              {image && inferenceTime && (
                <div className="flex flex-row space-x-1 text-sm w-full mb-2">
                  <span className="text-neutral-500">Inference time:</span>
                  <span
                    className={
                      !inferenceTime ? "text-neutral-500" : "text-green-400"
                    }
                  >
                    {inferenceTime
                      ? `${(inferenceTime * 1000).toFixed(0)}ms`
                      : `n/a`}
                  </span>
                </div>
              )}
              <div className="md:min-h-[512px] max-w-fit">
                {image && (
                  <img id="imageDisplay" src={image} alt="Dynamic Image" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 py-6">
          <div className="container flex flex-col items-center justify-center my-4">
            {/* Contact Links */}
            <div className="flex flex-col items-center text-center space-y-2">
              <a
                href="https://www.linkedin.com/in/divyanshrastogi30"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:underline"
              >
                <FaLinkedin size={20} />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://mail.google.com/mail/u/0/?view=cm&fs=1&to=divyansh30rastogi.@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:underline"
              >
                <SiGmail size={20} />
                <span>Email</span>
              </a>

              <a
                href="https://github.com/30Divyansh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:underline"
              >
                <FaGithub size={20} />
                <span>GitHub</span>
              </a>
              {/* <span>Made with love by Divyansh Rastogi </span> */}
              <span className="text-white text-sm font-medium flex items-center space-x-1">
                <span>Made with</span>
                <span className="text-red-400 animate-pulse">❤️</span>
                <span>by Divyansh Rastogi</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
