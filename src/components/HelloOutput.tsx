import React from "react";

interface HelloOutputProps {
  message: string;
}

const HelloOutput: React.FC<HelloOutputProps> = ({ message }) => {
  return <div className="text-blue-500">Ouput {message}</div>;
};

export default HelloOutput;
