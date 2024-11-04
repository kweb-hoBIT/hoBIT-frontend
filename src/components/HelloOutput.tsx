import React from "react";

interface HelloOutputProps {
  message: string;
}

const HelloOutput: React.FC<HelloOutputProps> = ({ message }) => {
  return <div>Ouput {message}</div>;
};

export default HelloOutput;
