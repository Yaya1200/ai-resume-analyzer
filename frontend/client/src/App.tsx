import { useState } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  
  const handleUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

     
      if (!selectedFile.name.endsWith(".docx")) {
        alert("Please upload a .docx file");
        return;
      }

      console.log("File selected:", selectedFile.name);
      setFile(selectedFile);
    }
  };


  const analyze = async () => {
    if (!file) {
      alert("Upload a Word file first");
      return;
    }

    setLoading(true);

    try {
      const reader = new FileReader();

      reader.onload = async function () {
        if (!reader.result) {
          alert("Error reading file");
          setLoading(false);
          return;
        }

    
        const base64 = reader.result.split(",")[1];

        console.log("Sending file to backend...");

        const res = await fetch("http://localhost:5000/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ file: base64 }),
        });

        const data = await res.json();

        console.log("Response:", data);

        setResult(data);
        setLoading(false);
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error(error);
      alert("Error connecting to backend");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl mb-6 font-bold">
        AI Resume Analyzer (Word)
      </h1>

      <input
        type="file"
        accept=".docx"
        onChange={handleUpload}
        className="mb-4"
      />
      <button
        onClick={analyze}
        className="bg-blue-600 px-4 py-2 rounded-lg"
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {result && (
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl mb-2">Score</h2>
            <p className="text-4xl text-green-400">
              {result.score}/100
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl mb-2">Suggestions</h2>
            <ul>
              {result.suggestions?.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl mb-2">Found Keywords</h2>
            <div>
              {result.foundKeywords?.map((k, i) => (
                <span
                  key={i}
                  className="mr-2 bg-green-600 px-2 py-1 rounded"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl mb-2">Missing Keywords</h2>
            <div>
              {result.missingKeywords?.map((k, i) => (
                <span
                  key={i}
                  className="mr-2 bg-red-600 px-2 py-1 rounded"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}