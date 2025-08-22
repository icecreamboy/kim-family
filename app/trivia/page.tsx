"use client";
import { useState } from 'react';
import { z } from 'zod';

const triviaFormSchema = z.object({
  fandom: z.string().min(1, 'Fandom is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  count: z.number().min(1).max(10),
});

const TriviaPage = () => {
  const [formData, setFormData] = useState({
    fandom: '',
    difficulty: 'easy',
    count: 1,
  });
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      triviaFormSchema.parse(formData);
      const response = await fetch('/api/trivia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trivia questions');
      }

      const data = await response.json();
      setQuestions(data.items);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trivia Generator</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <label className="block mb-1">Fandom</label>
          <select name="fandom" value={formData.fandom} onChange={handleChange} required>
            <option value="">Select a fandom</option>
            <option value="Dragon Ball">Dragon Ball</option>
            <option value="One Piece">One Piece</option>
            <option value="Land of Stories">Land of Stories</option>
            <option value="K-Pop Demon Hunters">K-Pop Demon Hunters</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="block mb-1">Difficulty</label>
          <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="block mb-1">Number of Questions</label>
          <input
            type="number"
            name="count"
            min="1"
            max="10"
            value={formData.count}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Generate Trivia
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        {questions.length > 0 && (
          <ul>
            {questions.map((item, index) => (
              <li key={index} className="mb-2">
                <div className="font-semibold">{item.question}</div>
                <button
                  onClick={() => alert(item.answer)}
                  className="text-blue-500 underline"
                >
                  Reveal Answer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TriviaPage;