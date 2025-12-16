import { useActionState } from "react"; //buat handle form berdasarkan output dari form action dan form state
import { explainCode } from "../actions";
import CodeExplanation from "../CodeExplanation";
import Error from "../Error";

const CodeExplainForm = () => {
  const [formState, formAction, isPending] = useActionState(explainCode, null);

  return (
    <div className="mt-16 w-[70%] bg-white shadow-lg border border-gray-300 rounded-lg p-6">
      <form action={formAction}>
        <label className="block mb-2 font-semibold">Language:</label>
        <select
          name="language"
          className="border rounded-lg p-2 w-full mb-4"
          defaultValue={formState?.input?.language || "javascript"}
        >
          <option value="javascript">Javascript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <label className="block mb-2 font-semibold"> Your Code:</label>
        <textarea
          name="code"
          id="myTextarea"
          required
          placeholder="Paste your code here..."
          className="border rounded-lg p-2 w-full mb-4"
          defaultValue={formState?.input?.code || ""}
        />
        <button
          type="submit"
          className="hover:bg-blue-600 cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg"
          disabled={isPending}
        >
          {isPending ? "Explaining..." : "Explain Code"}
        </button>
        {isPending ? (
          <p className="bg-gray-300 my-3 w-64 p-2 rounded-sm">Thinking...</p>
        ) : formState?.success ? (
          <CodeExplanation explanation={formState?.data.explanation} />
        ) : (
          formState?.success === false && <Error error={formState?.error} />
        )}
      </form>
    </div>
  );
};

export default CodeExplainForm;
