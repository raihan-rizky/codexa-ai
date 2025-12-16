import PropTypes from "prop-types";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CopyToClipboard from "react-copy-to-clipboard";
import { FaCheck, FaCopy } from "react-icons/fa";
import { useState, useEffect } from "react";
const CodeExplanation = ({ explanation }) => {
  const textToCopy = explanation;
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
  };
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);
  return (
    <div className="w-full max-w-4xl mt-6 bg-gray-50 p-6  rounded-2xl shadow-lg">
      <div className="flex justify-end w-full">
        <CopyToClipboard
          text={textToCopy}
          className="cursor-pointer hover:text-blue-500"
          onCopy={handleCopy}
        >
          {isCopied ? <FaCheck /> : <FaCopy />}
        </CopyToClipboard>
      </div>
      <h2 className="text-2xl font-bold">Explanation:</h2>
      <Markdown remarkPlugins={[remarkGfm]}>{explanation}</Markdown>
    </div>
  );
};

CodeExplanation.propTypes = {
  explanation: PropTypes.string.isRequired,
};

export default CodeExplanation;
