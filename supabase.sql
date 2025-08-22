CREATE TABLE trivia_sets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    fandom text,
    difficulty text,
    count int
);

CREATE TABLE trivia_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    set_id uuid REFERENCES trivia_sets(id) ON DELETE CASCADE,
    question text,
    answer text,
    difficulty text,
    source_hint text
);